import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Delete, Put } from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { Clinic } from '../entities/clinic.entity';
import { Patient } from '../entities/patient.entity';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
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

  // ========== 账户管理功能 ==========

  // 获取所有用户（根据角色过滤）
  @Get('users')
  @UseGuards(JwtAuthGuard)
  async listUsers(@Request() req) {
    const { role } = req.query || {};
    const whereCondition: any = { is_deleted: 0 };
    
    if (role) {
      whereCondition.role = role;
    }

    const users = await this.adminUserRepository.find({ 
      where: whereCondition,
      order: { created_at: 'DESC' }
    });
    
    const sanitized = users.map((u) => {
      const { password, token, refresh_token, token_expires_at, refresh_token_expires_at, ...rest } = u as any;
      return rest;
    });
    
    return { success: true, data: sanitized };
  }

  // 获取所有患者（从smile_test表获取）
  @Get('patients')
  @UseGuards(JwtAuthGuard)
  async listPatients() {
    // 从smile_test表获取患者数据
    const patients = await this.adminUserRepository.query(`
      SELECT 
        id,
        test_id as patient_id,
        uuid,
        full_name,
        phone,
        email,
        gender,
        birth_date,
        city,
        address,
        emergency_contact,
        emergency_phone,
        test_status as status,
        created_at,
        updated_at,
        is_deleted
      FROM smile_test 
      WHERE is_deleted = 0 
      ORDER BY created_at DESC
    `);
    
    return { success: true, data: patients };
  }

  // 创建诊所
  @Post('clinics')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createClinic(@Body() body: any) {
    const { clinic_name, clinic_code, address, city, district, province, phone, email, owner_name, owner_phone, owner_email } = body || {};
    
    if (!clinic_name) {
      throw new BadRequestException('缺少必要字段：clinic_name');
    }

    // 生成UUID
    const uuid = crypto.randomUUID();

    const clinic = this.clinicRepository.create({
      uuid,
      clinic_name,
      clinic_code: clinic_code || null,
      address: address || null,
      city: city || null,
      district: district || null,
      province: province || null,
      phone: phone || null,
      email: email || null,
      owner_name: owner_name || null,
      owner_phone: owner_phone || null,
      owner_email: owner_email || null,
      status: 'active',
      is_deleted: 0 as any,
    } as any);

    const saved = await this.clinicRepository.save(clinic);
    return { success: true, data: saved, message: '診所創建成功' };
  }

  // 创建患者（保存到smile_test表）
  @Post('patients')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createPatient(@Body() body: any) {
    const { full_name, phone, email, birth_date, gender, address, city, district, emergency_contact, emergency_phone } = body || {};
    
    if (!full_name) {
      throw new BadRequestException('缺少必要字段：full_name');
    }

    // 生成UUID
    const uuid = crypto.randomUUID();

    // 直接插入到smile_test表
    const result = await this.adminUserRepository.query(`
      INSERT INTO smile_test (
        uuid,
        full_name,
        phone,
        email,
        birth_date,
        gender,
        address,
        city,
        emergency_contact,
        emergency_phone,
        test_status,
        is_deleted,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, NOW(), NOW())
    `, [
      uuid,
      full_name,
      phone || null,
      email || null,
      birth_date || null,
      gender || null,
      address || null,
      city || null,
      emergency_contact || null,
      emergency_phone || null
    ]);

    // 获取刚插入的数据
    const [savedPatient] = await this.adminUserRepository.query(`
      SELECT 
        id,
        test_id as patient_id,
        uuid,
        full_name,
        phone,
        email,
        gender,
        birth_date,
        city,
        address,
        emergency_contact,
        emergency_phone,
        test_status as status,
        created_at,
        updated_at,
        is_deleted
      FROM smile_test 
      WHERE id = ?
    `, [result.insertId]);

    return { success: true, data: savedPatient, message: '患者創建成功' };
  }

  // 删除/关闭用户账户
  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Request() req) {
    const { id } = req.params;
    
    if (!id) {
      throw new BadRequestException('缺少必要字段：id');
    }

    const user = await this.adminUserRepository.findOne({ where: { id: parseInt(id), is_deleted: 0 } as any });
    if (!user) {
      throw new BadRequestException('用戶不存在或已被刪除');
    }

    // 软删除
    await this.adminUserRepository.update(parseInt(id), { 
      is_deleted: 1 as any,
      deleted_at: new Date(),
      status: 'inactive'
    } as any);

    return { success: true, message: '用戶已刪除' };
  }

  // 删除/关闭诊所
  @Delete('clinics/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteClinic(@Request() req) {
    const { id } = req.params;
    
    if (!id) {
      throw new BadRequestException('缺少必要字段：id');
    }

    const clinic = await this.clinicRepository.findOne({ where: { id: parseInt(id), is_deleted: 0 } as any });
    if (!clinic) {
      throw new BadRequestException('診所不存在或已被刪除');
    }

    // 软删除
    await this.clinicRepository.update(parseInt(id), { 
      is_deleted: 1 as any,
      deleted_at: new Date(),
      status: 'closed'
    } as any);

    return { success: true, message: '診所已關閉' };
  }

  // 删除/关闭患者（从smile_test表）
  @Delete('patients/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deletePatient(@Request() req) {
    const { id } = req.params;
    
    if (!id) {
      throw new BadRequestException('缺少必要字段：id');
    }

    // 检查患者是否存在
    const [patient] = await this.adminUserRepository.query(`
      SELECT id, full_name FROM smile_test WHERE id = ? AND is_deleted = 0
    `, [parseInt(id)]);
    
    if (!patient) {
      throw new BadRequestException('患者不存在或已被刪除');
    }

    // 软删除
    await this.adminUserRepository.query(`
      UPDATE smile_test 
      SET is_deleted = 1, deleted_at = NOW(), test_status = 'cancelled'
      WHERE id = ?
    `, [parseInt(id)]);

    return { success: true, message: '患者已關閉' };
  }

  // 更新用户状态（激活/停用）
  @Put('users/:id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(@Request() req, @Body() body: { status: string }) {
    const { id } = req.params;
    const { status } = body;
    
    if (!id || !status) {
      throw new BadRequestException('缺少必要字段：id 或 status');
    }

    const user = await this.adminUserRepository.findOne({ where: { id: parseInt(id), is_deleted: 0 } as any });
    if (!user) {
      throw new BadRequestException('用戶不存在或已被刪除');
    }

    await this.adminUserRepository.update(parseInt(id), { status } as any);
    return { success: true, message: '用戶狀態已更新' };
  }

  // 更新诊所状态
  @Put('clinics/:id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateClinicStatus(@Request() req, @Body() body: { status: string }) {
    const { id } = req.params;
    const { status } = body;
    
    if (!id || !status) {
      throw new BadRequestException('缺少必要字段：id 或 status');
    }

    const clinic = await this.clinicRepository.findOne({ where: { id: parseInt(id), is_deleted: 0 } as any });
    if (!clinic) {
      throw new BadRequestException('診所不存在或已被刪除');
    }

    await this.clinicRepository.update(parseInt(id), { status } as any);
    return { success: true, message: '診所狀態已更新' };
  }

  // 更新患者状态（smile_test表）
  @Put('patients/:id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePatientStatus(@Request() req, @Body() body: { status: string }) {
    const { id } = req.params;
    const { status } = body;
    
    if (!id || !status) {
      throw new BadRequestException('缺少必要字段：id 或 status');
    }

    // 检查患者是否存在
    const [patient] = await this.adminUserRepository.query(`
      SELECT id, full_name FROM smile_test WHERE id = ? AND is_deleted = 0
    `, [parseInt(id)]);
    
    if (!patient) {
      throw new BadRequestException('患者不存在或已被刪除');
    }

    // 更新状态（将status映射到test_status）
    const testStatusMap = {
      'active': 'pending',
      'inactive': 'cancelled',
      'suspended': 'cancelled',
      'discharged': 'completed'
    };

    await this.adminUserRepository.query(`
      UPDATE smile_test 
      SET test_status = ?
      WHERE id = ?
    `, [testStatusMap[status] || status, parseInt(id)]);

    return { success: true, message: '患者狀態已更新' };
  }
} 