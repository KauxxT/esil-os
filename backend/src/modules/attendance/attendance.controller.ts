import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

class GenerateCodeDto {
  @IsUUID()
  lessonId: string;

  @IsInt()
  @IsOptional()
  ttlMinutes?: number;
}

class MarkAttendanceDto {
  @IsString()
  code: string;
}

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('generate')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  generate(@Body() dto: GenerateCodeDto, @Req() req) {
    return this.attendanceService.generateCode(dto.lessonId, req.user.id, dto.ttlMinutes);
  }

  @Post('mark')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  mark(@Body() dto: MarkAttendanceDto, @Req() req) {
    return this.attendanceService.markAttendance(dto.code, req.user.id);
  }

  @Get(':lessonId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  getRecords(@Param('lessonId') lessonId: string) {
    return this.attendanceService.getRecords(lessonId);
  }
}
