import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.adminUserRepository.findOne({
      where: { id: payload.sub, is_deleted: false }
    });

    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('帳戶已被停用');
    }

    // 检查token是否过期
    if (user.token_expires_at && user.token_expires_at < new Date()) {
      throw new UnauthorizedException('令牌已過期');
    }

    return {
      id: user.id,
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
    };
  }
} 