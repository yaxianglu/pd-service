import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AdminUser, AdminUserStatus } from '../entities/admin-user.entity';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      user_id: string | null;
      username: string;
      email: string | null;
      full_name: string | null;
      role: string;
      department: string | null;
      position: string | null;
      avatar: string | null;
    };
    token: string;
    refresh_token: string;
    expires_in: number;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<AdminUser> {
    console.log('=== 开始验证用户 ===');
    console.log('用户名:', username);
    console.log('密码长度:', password.length);
    
    const user = await this.adminUserRepository.findOne({
      where: { username, is_deleted: 0 }
    });

    if (!user) {
      console.log('用户不存在');
      throw new UnauthorizedException('用戶名或密碼錯誤');
    }

    console.log('找到用户:', {
      id: user.id,
      username: user.username,
      status: user.status,
      passwordLength: user.password.length,
      passwordPrefix: user.password.substring(0, 10) + '...'
    });

    if (user.status !== AdminUserStatus.ACTIVE) {
      console.log('用户状态不是active:', user.status);
      throw new UnauthorizedException('帳戶已被停用');
    }

    // 检查账户是否被锁定
    if (user.locked_until && user.locked_until > new Date()) {
      console.log('账户被锁定');
      throw new UnauthorizedException('帳戶已被鎖定，請稍後再試');
    }

    // 验证密码
    console.log('开始验证密码...');
    const isPasswordValid = await this.verifyPassword(password, user.password);
    console.log('密码验证结果:', isPasswordValid);
    
    if (!isPasswordValid) {
      // 增加登录失败次数
      await this.incrementLoginAttempts(user);
      throw new UnauthorizedException('用戶名或密碼錯誤');
    }

    // 登录成功，重置登录失败次数
    await this.resetLoginAttempts(user);
    console.log('=== 用户验证成功 ===');
    
    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { username, password } = loginDto;

    if (!username || !password) {
      throw new BadRequestException('請提供用戶名和密碼');
    }

    const user = await this.validateUser(username, password);

    // 生成token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 更新用户的token信息
    await this.updateUserTokens(user.id, token, refreshToken);

    // 更新最后登录时间
    await this.updateLastLogin(user.id);

    return {
      success: true,
      message: '登入成功',
      data: {
        user: {
          id: user.id,
          user_id: user.user_id || '',
          username: user.username,
          email: user.email || '',
          full_name: user.full_name || '',
          role: user.role,
          department: user.department || '',
          position: user.position || '',
          avatar: user.avatar || '',
        },
        token,
        refresh_token: refreshToken,
        expires_in: 24 * 60 * 60, // 24小时，单位：秒
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      });

      const user = await this.adminUserRepository.findOne({
        where: { id: payload.sub, is_deleted: 0 }
      });

      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('無效的刷新令牌');
      }

      // 检查刷新令牌是否过期
      if (user.refresh_token_expires_at && user.refresh_token_expires_at < new Date()) {
        throw new UnauthorizedException('刷新令牌已過期');
      }

      // 生成新的token
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // 更新用户的token信息
      await this.updateUserTokens(user.id, newToken, newRefreshToken);

      return {
        success: true,
        message: '令牌刷新成功',
        data: {
          user: {
            id: user.id,
            user_id: user.user_id || '',
            username: user.username,
            email: user.email || '',
            full_name: user.full_name || '',
            role: user.role,
            department: user.department || '',
            position: user.position || '',
            avatar: user.avatar || '',
          },
          token: newToken,
          refresh_token: newRefreshToken,
          expires_in: 24 * 60 * 60,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('無效的刷新令牌');
    }
  }

  async logout(userId: number): Promise<{ success: boolean; message: string }> {
    await this.adminUserRepository.update(userId, {
      token: null,
      token_expires_at: null,
      refresh_token: null,
      refresh_token_expires_at: null,
    });

    return {
      success: true,
      message: '登出成功',
    };
  }

  async getUserProfile(userId: number) {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId, is_deleted: 0 },
      select: [
        'id', 'user_id', 'username', 'email', 'full_name', 'phone',
        'role', 'department', 'position', 'status', 'avatar', 'bio',
        'timezone', 'language', 'theme', 'created_at', 'last_login_at'
      ]
    });

    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }

    return {
      success: true,
      data: user,
    };
  }

  private generateToken(user: AdminUser): string {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      user_id: user.user_id,
    };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: AdminUser): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    console.log('Password verification:', {
      inputPassword: plainPassword.substring(0, 20) + '...',
      storedPassword: hashedPassword.substring(0, 20) + '...',
      inputLength: plainPassword.length,
      storedLength: hashedPassword.length
    });

    // 如果密码是明文存储的（开发环境），直接比较
    if (hashedPassword.startsWith('hashed_')) {
      const hash = hashedPassword.replace('hashed_', '');
      // 前端已经发送了哈希值，直接比较
      console.log('Comparing hashes:', { 
        inputHash: plainPassword.substring(0, 20) + '...', 
        storedHash: hash.substring(0, 20) + '...', 
        match: plainPassword === hash 
      });
      return plainPassword === hash;
    }
    
    // 使用bcrypt验证密码
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private simpleHash(password: string): string {
    // 简单的哈希函数，仅用于开发环境
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private async incrementLoginAttempts(user: AdminUser): Promise<void> {
    const newAttempts = (user.login_attempts || 0) + 1;
    const updateData: any = { login_attempts: newAttempts };

    // 如果失败次数达到5次，锁定账户30分钟
    if (newAttempts >= 5) {
      updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30分钟
    }

    await this.adminUserRepository.update(user.id, updateData);
  }

  private async resetLoginAttempts(user: AdminUser): Promise<void> {
    await this.adminUserRepository.update(user.id, {
      login_attempts: 0,
      locked_until: null,
    });
  }

  private async updateUserTokens(userId: number, token: string, refreshToken: string): Promise<void> {
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天

    await this.adminUserRepository.update(userId, {
      token,
      token_expires_at: tokenExpiresAt,
      refresh_token: refreshToken,
      refresh_token_expires_at: refreshTokenExpiresAt,
    });
  }

  private async updateLastLogin(userId: number): Promise<void> {
    await this.adminUserRepository.update(userId, {
      last_login_at: new Date(),
    });
  }
} 