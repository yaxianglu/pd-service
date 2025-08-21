import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { Clinic } from '../entities/clinic.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.id);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req) {
    return {
      success: true,
      message: '令牌有效',
      data: {
        user: req.user,
      },
    };
  }

  // 获取所有医生用户（去除敏感字段）
  @Get('doctors')
  @UseGuards(JwtAuthGuard)
  async listDoctors() {
    const users = await this.adminUserRepository.find({ 
      where: { role: 'doctor', is_deleted: 0 },
      order: { created_at: 'DESC' } // 按创建日期降序排序，最新的在最上面
    });
    const sanitized = users.map((u) => {
      const { password, token, refresh_token, token_expires_at, refresh_token_expires_at, ...rest } = u as any;
      return rest;
    });
    return { success: true, data: sanitized };
  }

  // 获取诊所列表（去除已删除）
  @Get('clinics')
  @UseGuards(JwtAuthGuard)
  async listClinics() {
    const clinics = await this.clinicRepository.find({ 
      where: { is_deleted: 0 } as any,
      order: { created_at: 'DESC' } // 按创建日期降序排序，最新的在最上面
    });
    return { success: true, data: clinics };
  }

  // 获取医生及其诊所信息
  @Get('doctors-with-clinic')
  @UseGuards(JwtAuthGuard)
  async listDoctorsWithClinic() {
    const doctors = await this.adminUserRepository.find({ 
      where: { role: 'doctor', is_deleted: 0 } as any,
      order: { created_at: 'DESC' } // 按创建日期降序排序，最新的在最上面
    });
    const clinicUuids = Array.from(new Set(doctors.map((d: any) => d.department).filter(Boolean)));
    const clinics = clinicUuids.length > 0 ? await this.clinicRepository.find({ 
      where: { uuid: In(clinicUuids), is_deleted: 0 } as any,
      order: { created_at: 'DESC' } // 按创建日期降序排序，最新的在最上面
    }) : [];
    const clinicMap: Record<string, any> = {};
    clinics.forEach((c) => { clinicMap[(c as any).uuid] = c; });
    const data = doctors.map((u: any) => {
      const { password, token, refresh_token, token_expires_at, refresh_token_expires_at, ...rest } = u as any;
      return {
        ...rest,
        clinic: u.department ? clinicMap[u.department] || null : null,
      };
    });
    return { success: true, data };
  }

  // 创建管理员用户（默认创建医生账号，并可绑定诊所）
  @Post('users')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createAdminUser(@Body() body: any) {
    const { username, password, email, phone, full_name, role = 'doctor', department } = body || {};
    if (!username || !password) {
      throw new BadRequestException('缺少必要字段：username 或 password');
    }

    // 唯一性校验
    const existing = await this.adminUserRepository.findOne({ where: { username } });
    if (existing && (existing as any).is_deleted === 0) {
      throw new BadRequestException('用戶名已存在');
    }

    // 如果有诊所，检查诊所是否存在
    if (department) {
      const clinic = await this.clinicRepository.findOne({ where: { uuid: department, is_deleted: 0 } as any });
      if (!clinic) {
        throw new BadRequestException('診所不存在或已被刪除');
      }
    }

    // 存储规则：沿用登录逻辑，若前端发送 SHA-256 字符串，则以 'hashed_' 前缀保存
    const storedPassword = password.length === 64 ? `hashed_${password}` : password;

    const user = this.adminUserRepository.create({
      username,
      password: storedPassword,
      email: email || null,
      phone: phone || null,
      full_name: full_name || null,
      role,
      status: 'active',
      department: department || null,
      is_deleted: 0 as any,
    } as any);

    const saved = await this.adminUserRepository.save(user);
    const { password: _, token, refresh_token, token_expires_at, refresh_token_expires_at, ...safe } = saved as any;
    return { success: true, data: safe, message: '創建成功' };
  }

  // 修改密码
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('缺少必要字段：currentPassword 或 newPassword');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('新密碼至少需要6個字符');
    }

    return this.authService.changePassword(req.user.id, currentPassword, newPassword);
  }
} 