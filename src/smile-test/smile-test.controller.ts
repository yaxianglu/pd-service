import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus, Query, Res } from '@nestjs/common';
import { SmileTestService, SmileTestData } from './smile-test.service';
import { Response } from 'express';
import * as JSZip from 'jszip';
import axios from 'axios';

@Controller('api/smile-test')
export class SmileTestController {
  constructor(private readonly smileTestService: SmileTestService) {}

  @Get()
  async listAll() {
    try {
      const data = await this.smileTestService.findAll();
      return { success: true, data };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取数据失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('uuid/:uuid')
  async getSmileTestByUuid(@Param('uuid') uuid: string) {
    try {
      const result = await this.smileTestService.findByUuidWithRelations(uuid);
      
      if (!result) {
        return {
          success: false,
          message: 'UUID不存在或已失效'
        };
      }

      return {
        success: true,
        data: {
          // 微笑测试基本信息
          smileTest: {
            id: result.smileTest.id,
            test_id: result.smileTest.test_id,
            uuid: result.smileTest.uuid,
            full_name: result.smileTest.full_name,
            birth_date: result.smileTest.birth_date,
            phone: result.smileTest.phone,
            email: result.smileTest.email,
            line_id: result.smileTest.line_id,
            city: result.smileTest.city,
            teeth_type: result.smileTest.teeth_type,
            considerations: result.smileTest.considerations,
            improvement_points: result.smileTest.improvement_points,
            teeth_image_1: result.smileTest.teeth_image_1,
            teeth_image_2: result.smileTest.teeth_image_2,
            teeth_image_3: result.smileTest.teeth_image_3,
            teeth_image_4: result.smileTest.teeth_image_4,
            age: result.smileTest.age,
            gender: result.smileTest.gender,
            occupation: result.smileTest.occupation,
            address: result.smileTest.address,
            emergency_contact: result.smileTest.emergency_contact,
            emergency_phone: result.smileTest.emergency_phone,
            dental_history: result.smileTest.dental_history,
            current_issues: result.smileTest.current_issues,
            allergies: result.smileTest.allergies,
            medications: result.smileTest.medications,
            test_score: result.smileTest.test_score,
            confidence_level: result.smileTest.confidence_level,
            recommended_treatment: result.smileTest.recommended_treatment,
            estimated_cost: result.smileTest.estimated_cost,
            test_status: result.smileTest.test_status,
            appointment_date: result.smileTest.appointment_date,
            follow_up_date: result.smileTest.follow_up_date,
            patient_uuid: result.smileTest.patient_uuid,
            created_at: result.smileTest.created_at,
            updated_at: result.smileTest.updated_at
          },
          // 患者信息
          patient: result.patient ? {
            id: result.patient.id,
            patient_id: result.patient.patient_id,
            uuid: result.patient.uuid,
            full_name: result.patient.full_name,
            birth_date: result.patient.birth_date,
            gender: result.patient.gender,
            phone: result.patient.phone,
            email: result.patient.email,
            line_id: result.patient.line_id,
            wechat_id: result.patient.wechat_id,
            address: result.patient.address,
            city: result.patient.city,
            district: result.patient.district,
            postal_code: result.patient.postal_code,
            emergency_contact: result.patient.emergency_contact,
            emergency_phone: result.patient.emergency_phone,
            blood_type: result.patient.blood_type,
            allergies: result.patient.allergies,
            medical_history: result.patient.medical_history,
            current_medications: result.patient.current_medications,
            dental_history: result.patient.dental_history,
            insurance_provider: result.patient.insurance_provider,
            insurance_number: result.patient.insurance_number,
            clinic_id: result.patient.clinic_id,
            assigned_doctor_uuid: result.patient.assigned_doctor_uuid,
            receptionist_id: result.patient.receptionist_id,
            referral_source: result.patient.referral_source,
            first_visit_date: result.patient.first_visit_date,
            last_visit_date: result.patient.last_visit_date,
            next_appointment_date: result.patient.next_appointment_date,
            treatment_status: result.patient.treatment_status,
            treatment_phase: result.patient.treatment_phase,
            treatment_progress: result.patient.treatment_progress,
            estimated_completion_date: result.patient.estimated_completion_date,
            actual_completion_date: result.patient.actual_completion_date,
            selected_treatment_plan: result.patient.selected_treatment_plan,
            selected_products: result.patient.selected_products,
            treatment_notes: result.patient.treatment_notes,
            special_requirements: result.patient.special_requirements,
            total_cost: result.patient.total_cost,
            paid_amount: result.patient.paid_amount,
            remaining_balance: result.patient.remaining_balance,
            payment_status: result.patient.payment_status,
            payment_method: result.patient.payment_method,
            installment_plan: result.patient.installment_plan,
            discount_amount: result.patient.discount_amount,
            discount_reason: result.patient.discount_reason,
            appointment_reminder: result.patient.appointment_reminder,
            reminder_method: result.patient.reminder_method,
            reminder_time: result.patient.reminder_time,
            no_show_count: result.patient.no_show_count,
            cancellation_count: result.patient.cancellation_count,
            satisfaction_rating: result.patient.satisfaction_rating,
            service_rating: result.patient.service_rating,
            doctor_rating: result.patient.doctor_rating,
            facility_rating: result.patient.facility_rating,
            review_text: result.patient.review_text,
            review_date: result.patient.review_date,
            status: result.patient.status,
            is_verified: result.patient.is_verified,
            verified_at: result.patient.verified_at,
            is_vip: result.patient.is_vip,
            vip_level: result.patient.vip_level,
            avatar_url: result.patient.avatar_url,
            occupation: result.patient.occupation,
            education_level: result.patient.education_level,
            marital_status: result.patient.marital_status,
            family_members: result.patient.family_members,
            hobbies: result.patient.hobbies,
            preferred_language: result.patient.preferred_language,
            communication_preference: result.patient.communication_preference,
            created_at: result.patient.created_at,
            updated_at: result.patient.updated_at
          } : null,
          // 医生信息
          doctor: result.doctor ? {
            id: result.doctor.id,
            user_id: result.doctor.user_id,
            uuid: result.doctor.uuid,
            username: result.doctor.username,
            email: result.doctor.email,
            full_name: result.doctor.full_name,
            phone: result.doctor.phone,
            role: result.doctor.role,
            permissions: result.doctor.permissions,
            department: result.doctor.department,
            position: result.doctor.position,
            status: result.doctor.status,
            is_verified: result.doctor.is_verified,
            verified_at: result.doctor.verified_at,
            avatar: result.doctor.avatar,
            bio: result.doctor.bio,
            timezone: result.doctor.timezone,
            language: result.doctor.language,
            theme: result.doctor.theme,
            notification_settings: result.doctor.notification_settings,
            last_login_at: result.doctor.last_login_at,
            created_at: result.doctor.created_at,
            updated_at: result.doctor.updated_at
          } : null,
          // 诊所信息
          clinic: result.clinic ? {
            id: result.clinic.id,
            clinic_id: result.clinic.clinic_id,
            uuid: result.clinic.uuid,
            clinic_name: result.clinic.clinic_name,
            clinic_code: result.clinic.clinic_code,
            address: result.clinic.address,
            city: result.clinic.city,
            district: result.clinic.district,
            province: result.clinic.province,
            country: result.clinic.country,
            phone: result.clinic.phone,
            email: result.clinic.email,
            website: result.clinic.website,
            line_id: result.clinic.line_id,
            wechat_id: result.clinic.wechat_id,
            clinic_type: result.clinic.clinic_type,
            specialties: result.clinic.specialties,
            owner_name: result.clinic.owner_name,
            chief_doctor: result.clinic.chief_doctor,
            doctor_count: result.clinic.doctor_count,
            staff_count: result.clinic.staff_count,
            facility_level: result.clinic.facility_level,
            services_offered: result.clinic.services_offered,
            rating: result.clinic.rating,
            review_count: result.clinic.review_count,
            patient_count: result.clinic.patient_count,
            satisfaction_rate: result.clinic.satisfaction_rate,
            status: result.clinic.status,
            is_verified: result.clinic.is_verified,
            is_featured: result.clinic.is_featured,
            logo_url: result.clinic.logo_url,
            banner_url: result.clinic.banner_url,
            description: result.clinic.description,
            highlights: result.clinic.highlights,
            created_at: result.clinic.created_at,
            updated_at: result.clinic.updated_at
          } : null
        },
        message: '获取数据成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取数据失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('by-doctor')
  async getByDoctor(@Query('uuid') uuid?: string, @Query('email') email?: string, @Query('username') username?: string) {
    try {
      const list = await this.smileTestService.findByDoctorWithPatients({ uuid, email, username });
      const data = list.map(result => ({
        smileTest: result.smileTest ? {
          id: result.smileTest.id,
          test_id: result.smileTest.test_id,
          uuid: result.smileTest.uuid,
          full_name: result.smileTest.full_name,
          birth_date: result.smileTest.birth_date,
          phone: result.smileTest.phone,
          email: result.smileTest.email,
          line_id: result.smileTest.line_id,
          city: result.smileTest.city,
          teeth_type: result.smileTest.teeth_type,
          considerations: result.smileTest.considerations,
          improvement_points: result.smileTest.improvement_points,
          teeth_image_1: result.smileTest.teeth_image_1,
          teeth_image_2: result.smileTest.teeth_image_2,
          teeth_image_3: result.smileTest.teeth_image_3,
          teeth_image_4: result.smileTest.teeth_image_4,
          age: result.smileTest.age,
          gender: result.smileTest.gender,
          occupation: result.smileTest.occupation,
          address: result.smileTest.address,
          emergency_contact: result.smileTest.emergency_contact,
          emergency_phone: result.smileTest.emergency_phone,
          dental_history: result.smileTest.dental_history,
          current_issues: result.smileTest.current_issues,
          allergies: result.smileTest.allergies,
          medications: result.smileTest.medications,
          test_score: result.smileTest.test_score,
          confidence_level: result.smileTest.confidence_level,
          recommended_treatment: result.smileTest.recommended_treatment,
          estimated_cost: result.smileTest.estimated_cost,
          test_status: result.smileTest.test_status,
          appointment_date: result.smileTest.appointment_date,
          follow_up_date: result.smileTest.follow_up_date,
          patient_uuid: result.smileTest.patient_uuid,
          created_at: result.smileTest.created_at,
          updated_at: result.smileTest.updated_at
        } : null,
        patient: result.patient ? {
          id: result.patient.id,
          patient_id: result.patient.patient_id,
          uuid: result.patient.uuid,
          full_name: result.patient.full_name,
          birth_date: result.patient.birth_date,
          gender: result.patient.gender,
          phone: result.patient.phone,
          email: result.patient.email,
          line_id: result.patient.line_id,
          wechat_id: result.patient.wechat_id,
          address: result.patient.address,
          city: result.patient.city,
          district: result.patient.district,
          postal_code: result.patient.postal_code,
          emergency_contact: result.patient.emergency_contact,
          emergency_phone: result.patient.emergency_phone,
          blood_type: result.patient.blood_type,
          allergies: result.patient.allergies,
          medical_history: result.patient.medical_history,
          current_medications: result.patient.current_medications,
          dental_history: result.patient.dental_history,
          insurance_provider: result.patient.insurance_provider,
          insurance_number: result.patient.insurance_number,
          clinic_id: result.patient.clinic_id,
          assigned_doctor_uuid: result.patient.assigned_doctor_uuid,
          receptionist_id: result.patient.receptionist_id,
          referral_source: result.patient.referral_source,
          first_visit_date: result.patient.first_visit_date,
          last_visit_date: result.patient.last_visit_date,
          next_appointment_date: result.patient.next_appointment_date,
          treatment_status: result.patient.treatment_status,
          treatment_phase: result.patient.treatment_phase,
          treatment_progress: result.patient.treatment_progress,
          estimated_completion_date: result.patient.estimated_completion_date,
          actual_completion_date: result.patient.actual_completion_date,
          selected_treatment_plan: result.patient.selected_treatment_plan,
          selected_products: result.patient.selected_products,
          treatment_notes: result.patient.treatment_notes,
          special_requirements: result.patient.special_requirements,
          total_cost: result.patient.total_cost,
          paid_amount: result.patient.paid_amount,
          remaining_balance: result.patient.remaining_balance,
          payment_status: result.patient.payment_status,
          payment_method: result.patient.payment_method,
          installment_plan: result.patient.installment_plan,
          discount_amount: result.patient.discount_amount,
          discount_reason: result.patient.discount_reason,
          appointment_reminder: result.patient.appointment_reminder,
          reminder_method: result.patient.reminder_method,
          reminder_time: result.patient.reminder_time,
          no_show_count: result.patient.no_show_count,
          cancellation_count: result.patient.cancellation_count,
          satisfaction_rating: result.patient.satisfaction_rating,
          service_rating: result.patient.service_rating,
          doctor_rating: result.patient.doctor_rating,
          facility_rating: result.patient.facility_rating,
          review_text: result.patient.review_text,
          review_date: result.patient.review_date,
          status: result.patient.status,
          is_verified: result.patient.is_verified,
          verified_at: result.patient.verified_at,
          is_vip: result.patient.is_vip,
          vip_level: result.patient.vip_level,
          avatar_url: result.patient.avatar_url,
          occupation: result.patient.occupation,
          education_level: result.patient.education_level,
          marital_status: result.patient.marital_status,
          family_members: result.patient.family_members,
          hobbies: result.patient.hobbies,
          preferred_language: result.patient.preferred_language,
          communication_preference: result.patient.communication_preference,
          created_at: result.patient.created_at,
          updated_at: result.patient.updated_at
        } : null,
        doctor: result.doctor ? {
          id: result.doctor.id,
          user_id: result.doctor.user_id,
          uuid: result.doctor.uuid,
          username: result.doctor.username,
          email: result.doctor.email,
          full_name: result.doctor.full_name,
          phone: result.doctor.phone,
          role: result.doctor.role,
          permissions: result.doctor.permissions,
          department: result.doctor.department,
          position: result.doctor.position,
          status: result.doctor.status,
          is_verified: result.doctor.is_verified,
          verified_at: result.doctor.verified_at,
          avatar: result.doctor.avatar,
          bio: result.doctor.bio,
          timezone: result.doctor.timezone,
          language: result.doctor.language,
          theme: result.doctor.theme,
          notification_settings: result.doctor.notification_settings,
          last_login_at: result.doctor.last_login_at,
          created_at: result.doctor.created_at,
          updated_at: result.doctor.updated_at
        } : null,
        clinic: result.clinic ? {
          id: result.clinic.id,
          clinic_id: result.clinic.clinic_id,
          uuid: result.clinic.uuid,
          clinic_name: result.clinic.clinic_name,
          clinic_code: result.clinic.clinic_code,
          address: result.clinic.address,
          city: result.clinic.city,
          district: result.clinic.district,
          province: result.clinic.province,
          country: result.clinic.country,
          phone: result.clinic.phone,
          email: result.clinic.email,
          website: result.clinic.website,
          line_id: result.clinic.line_id,
          wechat_id: result.clinic.wechat_id,
          clinic_type: result.clinic.clinic_type,
          specialties: result.clinic.specialties,
          owner_name: result.clinic.owner_name,
          chief_doctor: result.clinic.chief_doctor,
          doctor_count: result.clinic.doctor_count,
          staff_count: result.clinic.staff_count,
          facility_level: result.clinic.facility_level,
          services_offered: result.clinic.services_offered,
          rating: result.clinic.rating,
          review_count: result.clinic.review_count,
          patient_count: result.clinic.patient_count,
          satisfaction_rate: result.clinic.satisfaction_rate,
          status: result.clinic.status,
          is_verified: result.clinic.is_verified,
          is_featured: result.clinic.is_featured,
          logo_url: result.clinic.logo_url,
          banner_url: result.clinic.banner_url,
          description: result.clinic.description,
          highlights: result.clinic.highlights,
          created_at: result.clinic.created_at,
          updated_at: result.clinic.updated_at
        } : null,
      }));

      return { success: true, data };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取数据失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('uuid/:uuid/with-relations')
  async getSmileTestByUuidWithRelations(@Param('uuid') uuid: string) {
    try {
      const result = await this.smileTestService.findByUuidWithRelations(uuid);
      
      if (!result) {
        return {
          success: false,
          message: 'UUID不存在或已失效'
        };
      }

      return {
        success: true,
        data: {
          // 微笑测试基本信息
          smileTest: {
            id: result.smileTest.id,
            test_id: result.smileTest.test_id,
            uuid: result.smileTest.uuid,
            full_name: result.smileTest.full_name,
            birth_date: result.smileTest.birth_date,
            phone: result.smileTest.phone,
            email: result.smileTest.email,
            line_id: result.smileTest.line_id,
            city: result.smileTest.city,
            teeth_type: result.smileTest.teeth_type,
            considerations: result.smileTest.considerations,
            improvement_points: result.smileTest.improvement_points,
            teeth_image_1: result.smileTest.teeth_image_1,
            teeth_image_2: result.smileTest.teeth_image_2,
            teeth_image_3: result.smileTest.teeth_image_3,
            teeth_image_4: result.smileTest.teeth_image_4,
            age: result.smileTest.age,
            gender: result.smileTest.gender,
            occupation: result.smileTest.occupation,
            address: result.smileTest.address,
            emergency_contact: result.smileTest.emergency_contact,
            emergency_phone: result.smileTest.emergency_phone,
            dental_history: result.smileTest.dental_history,
            current_issues: result.smileTest.current_issues,
            allergies: result.smileTest.allergies,
            medications: result.smileTest.medications,
            test_score: result.smileTest.test_score,
            confidence_level: result.smileTest.confidence_level,
            recommended_treatment: result.smileTest.recommended_treatment,
            estimated_cost: result.smileTest.estimated_cost,
            test_status: result.smileTest.test_status,
            appointment_date: result.smileTest.appointment_date,
            follow_up_date: result.smileTest.follow_up_date,
            patient_uuid: result.smileTest.patient_uuid,
            created_at: result.smileTest.created_at,
            updated_at: result.smileTest.updated_at
          },
          // 患者信息
          patient: result.patient ? {
            id: result.patient.id,
            patient_id: result.patient.patient_id,
            uuid: result.patient.uuid,
            full_name: result.patient.full_name,
            birth_date: result.patient.birth_date,
            gender: result.patient.gender,
            phone: result.patient.phone,
            email: result.patient.email,
            line_id: result.patient.line_id,
            wechat_id: result.patient.wechat_id,
            address: result.patient.address,
            city: result.patient.city,
            district: result.patient.district,
            postal_code: result.patient.postal_code,
            emergency_contact: result.patient.emergency_contact,
            emergency_phone: result.patient.emergency_phone,
            blood_type: result.patient.blood_type,
            allergies: result.patient.allergies,
            medical_history: result.patient.medical_history,
            current_medications: result.patient.current_medications,
            dental_history: result.patient.dental_history,
            insurance_provider: result.patient.insurance_provider,
            insurance_number: result.patient.insurance_number,
            clinic_id: result.patient.clinic_id,
            assigned_doctor_uuid: result.patient.assigned_doctor_uuid,
            receptionist_id: result.patient.receptionist_id,
            referral_source: result.patient.referral_source,
            first_visit_date: result.patient.first_visit_date,
            last_visit_date: result.patient.last_visit_date,
            next_appointment_date: result.patient.next_appointment_date,
            treatment_status: result.patient.treatment_status,
            treatment_phase: result.patient.treatment_phase,
            treatment_progress: result.patient.treatment_progress,
            estimated_completion_date: result.patient.estimated_completion_date,
            actual_completion_date: result.patient.actual_completion_date,
            selected_treatment_plan: result.patient.selected_treatment_plan,
            selected_products: result.patient.selected_products,
            treatment_notes: result.patient.treatment_notes,
            special_requirements: result.patient.special_requirements,
            total_cost: result.patient.total_cost,
            paid_amount: result.patient.paid_amount,
            remaining_balance: result.patient.remaining_balance,
            payment_status: result.patient.payment_status,
            payment_method: result.patient.payment_method,
            installment_plan: result.patient.installment_plan,
            discount_amount: result.patient.discount_amount,
            discount_reason: result.patient.discount_reason,
            appointment_reminder: result.patient.appointment_reminder,
            reminder_method: result.patient.reminder_method,
            reminder_time: result.patient.reminder_time,
            no_show_count: result.patient.no_show_count,
            cancellation_count: result.patient.cancellation_count,
            satisfaction_rating: result.patient.satisfaction_rating,
            service_rating: result.patient.service_rating,
            doctor_rating: result.patient.doctor_rating,
            facility_rating: result.patient.facility_rating,
            review_text: result.patient.review_text,
            review_date: result.patient.review_date,
            status: result.patient.status,
            is_verified: result.patient.is_verified,
            verified_at: result.patient.verified_at,
            is_vip: result.patient.is_vip,
            vip_level: result.patient.vip_level,
            avatar_url: result.patient.avatar_url,
            occupation: result.patient.occupation,
            education_level: result.patient.education_level,
            marital_status: result.patient.marital_status,
            family_members: result.patient.family_members,
            hobbies: result.patient.hobbies,
            preferred_language: result.patient.preferred_language,
            communication_preference: result.patient.communication_preference,
            created_at: result.patient.created_at,
            updated_at: result.patient.updated_at
          } : null,
          // 医生信息
          doctor: result.doctor ? {
            id: result.doctor.id,
            user_id: result.doctor.user_id,
            uuid: result.doctor.uuid,
            username: result.doctor.username,
            email: result.doctor.email,
            full_name: result.doctor.full_name,
            phone: result.doctor.phone,
            role: result.doctor.role,
            permissions: result.doctor.permissions,
            department: result.doctor.department,
            position: result.doctor.position,
            status: result.doctor.status,
            is_verified: result.doctor.is_verified,
            verified_at: result.doctor.verified_at,
            avatar: result.doctor.avatar,
            bio: result.doctor.bio,
            timezone: result.doctor.timezone,
            language: result.doctor.language,
            theme: result.doctor.theme,
            notification_settings: result.doctor.notification_settings,
            last_login_at: result.doctor.last_login_at,
            created_at: result.doctor.created_at,
            updated_at: result.doctor.updated_at
          } : null,
          // 诊所信息
          clinic: result.clinic ? {
            id: result.clinic.id,
            clinic_id: result.clinic.clinic_id,
            uuid: result.clinic.uuid,
            clinic_name: result.clinic.clinic_name,
            clinic_code: result.clinic.clinic_code,
            address: result.clinic.address,
            city: result.clinic.city,
            district: result.clinic.district,
            province: result.clinic.province,
            country: result.clinic.country,
            phone: result.clinic.phone,
            email: result.clinic.email,
            website: result.clinic.website,
            line_id: result.clinic.line_id,
            wechat_id: result.clinic.wechat_id,
            clinic_type: result.clinic.clinic_type,
            specialties: result.clinic.specialties,
            owner_name: result.clinic.owner_name,
            chief_doctor: result.clinic.chief_doctor,
            doctor_count: result.clinic.doctor_count,
            staff_count: result.clinic.staff_count,
            facility_level: result.clinic.facility_level,
            services_offered: result.clinic.services_offered,
            rating: result.clinic.rating,
            review_count: result.clinic.review_count,
            patient_count: result.clinic.patient_count,
            satisfaction_rate: result.clinic.satisfaction_rate,
            status: result.clinic.status,
            is_verified: result.clinic.is_verified,
            is_featured: result.clinic.is_featured,
            logo_url: result.clinic.logo_url,
            banner_url: result.clinic.banner_url,
            description: result.clinic.description,
            highlights: result.clinic.highlights,
            created_at: result.clinic.created_at,
            updated_at: result.clinic.updated_at
          } : null
        },
        message: '获取关联数据成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取关联数据失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('validate-uuid/:uuid')
  async validateUuid(@Param('uuid') uuid: string) {
    try {
      const smileTest = await this.smileTestService.findByUuid(uuid);
      
      if (!smileTest) {
        return {
          success: false,
          message: 'UUID不存在或已失效'
        };
      }

      // 只返回基本信息，不包含敏感数据
      return {
        success: true,
        data: {
          uuid: smileTest.uuid,
          test_id: smileTest.test_id,
          full_name: smileTest.full_name,
          test_status: smileTest.test_status,
          created_at: smileTest.created_at
        },
        message: 'UUID验证成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '验证失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('test-id/:testId')
  async getSmileTestByTestId(@Param('testId') testId: string) {
    try {
      const result = await this.smileTestService.findByTestId(testId);
      if (!result) {
        return {
          success: true,
          data: null,
          message: 'No data found for this Test ID'
        };
      }
      return {
        success: true,
        data: result,
        message: 'Data retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async createSmileTest(@Body() data: SmileTestData) {
    try {
      const result = await this.smileTestService.create(data);
      return {
        success: true,
        data: result,
        message: 'Data created successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('uuid/:uuid')
  async updateSmileTestByUuid(@Param('uuid') uuid: string, @Body() data: SmileTestData) {
    try {
      const result = await this.smileTestService.saveOrUpdateByUuid(uuid, data);
      return {
        success: true,
        data: result,
        message: 'Data updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 更新 smile_test 的備註（覆用 considerations 字段）
  @Put('uuid/:uuid/bio')
  async updateSmileTestBio(@Param('uuid') uuid: string, @Body() body: { bio: string }) {
    try {
      const result = await this.smileTestService.updateByUuid(uuid, { considerations: body.bio });
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to update bio', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('test-id/:testId')
  async updateSmileTestByTestId(@Param('testId') testId: string, @Body() data: SmileTestData) {
    try {
      const result = await this.smileTestService.updateByTestId(testId, data);
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'No data found to update'
          },
          HttpStatus.NOT_FOUND
        );
      }
      return {
        success: true,
        data: result,
        message: 'Data updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('uuid/:uuid')
  async deleteSmileTestByUuid(@Param('uuid') uuid: string) {
    try {
      const result = await this.smileTestService.deleteByUuid(uuid);
      return {
        success: true,
        data: { deleted: result },
        message: result ? 'Data deleted successfully' : 'No data found to delete'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('test-id/:testId')
  async deleteSmileTestByTestId(@Param('testId') testId: string) {
    try {
      const result = await this.smileTestService.deleteByTestId(testId);
      return {
        success: true,
        data: { deleted: result },
        message: result ? 'Data deleted successfully' : 'No data found to delete'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 下載指定 UUID 的四張照片作為 ZIP
  @Get('uuid/:uuid/photos.zip')
  async downloadPhotosZip(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const result = await this.smileTestService.findByUuid(uuid);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: '記錄不存在' });
      }

      const urls: (string | null | undefined)[] = [
        (result as any).teeth_image_1,
        (result as any).teeth_image_2,
        (result as any).teeth_image_3,
        (result as any).teeth_image_4,
      ];

      const valid = urls.filter(Boolean) as string[];
      if (valid.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: '沒有可下載的照片' });
      }

      const ZipCtor: any = (JSZip as any)?.default || (JSZip as any);
      const zip = new ZipCtor();

      for (let i = 0; i < valid.length; i++) {
        const u = valid[i];
        if (u.startsWith('data:image/')) {
          // base64 內聯圖片
          const mime = u.substring(5, u.indexOf(';')) || 'image/jpeg';
          const ext = mime.split('/')[1] || 'jpg';
          const base64Data = u.split(',')[1] || '';
          zip.file(`photo_${i + 1}.${ext}`, base64Data, { base64: true });
        } else {
          // 網路圖片 URL
          const resp = await axios.get(u, { responseType: 'arraybuffer' });
          const nameFromUrl = (() => {
            const part = u.split('/').pop() || `photo_${i + 1}`;
            const clean = part.split('?')[0];
            if (clean.includes('.')) return clean;
            const contentType = resp.headers['content-type'] || 'image/jpeg';
            const ext = (contentType.split('/')[1] || 'jpg').split(';')[0];
            return `photo_${i + 1}.${ext}`;
          })();
          zip.file(nameFromUrl, Buffer.from(resp.data));
        }
      }

      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const fileName = `smile_photos_${uuid.slice(0, 8)}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: '打包失敗', error: (error as any)?.message });
    }
  }

  @Post('with-patient')
  async createWithPatient(@Body() body: any) {
    try {
      const result = await this.smileTestService.createWithPatient(body);
      return {
        success: true,
        data: {
          smileTest: result.smileTest,
          patient: result.patient,
          doctor: result.doctor,
          clinic: result.clinic,
        },
        message: 'Created successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create records',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 仅创建 Patient，并把现有的 smile_test 记录更新 patient_uuid
  @Post('bind-existing')
  async bindExisting(@Body() body: any) {
    const { smile_uuid, assigned_doctor_uuid } = body || {};
    if (!smile_uuid || !assigned_doctor_uuid) {
      throw new HttpException({ success: false, message: '缺少必要參數' }, HttpStatus.BAD_REQUEST);
    }
    try {
      const existing = await this.smileTestService.findByUuid(smile_uuid);
      if (!existing) {
        throw new HttpException({ success: false, message: '記錄不存在' }, HttpStatus.NOT_FOUND);
      }
      // 创建 patient
      const patient = await this.smileTestService.createPatient({
        full_name: existing.full_name,
        birth_date: existing.birth_date as any,
        gender: existing.gender as any,
        phone: existing.phone,
        email: existing.email,
        line_id: existing.line_id,
        city: existing.city,
        assigned_doctor_uuid,
      });
      if (!patient || !patient.uuid) {
        throw new HttpException({ success: false, message: '新建患者缺少UUID' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // 更新当前 smile_test 的 patient_uuid
      const updated = await this.smileTestService.updateByUuid(smile_uuid, { patient_uuid: patient.uuid as string });
      return { success: true, data: { patient, smileTest: updated } };
    } catch (error) {
      throw new HttpException(
        { success: false, message: '綁定失敗', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 