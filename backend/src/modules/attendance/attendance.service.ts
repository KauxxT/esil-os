import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async generateCode(lessonId: string, teacherId: string, ttlMinutes = 15) {
    // Deactivate previous codes for this lesson
    await this.prisma.attendanceCode.updateMany({
      where: { lessonId, isActive: true },
      data: { isActive: false },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    return this.prisma.attendanceCode.create({
      data: { code, lessonId, teacherId, expiresAt },
    });
  }

  async markAttendance(code: string, studentId: string) {
    const attendanceCode = await this.prisma.attendanceCode.findUnique({ where: { code } });

    if (!attendanceCode) throw new NotFoundException('Code not found');
    if (!attendanceCode.isActive) throw new BadRequestException('Code is no longer active');
    if (new Date() > attendanceCode.expiresAt) {
      await this.prisma.attendanceCode.update({ where: { id: attendanceCode.id }, data: { isActive: false } });
      throw new BadRequestException('Code has expired');
    }

    const already = await this.prisma.attendanceRecord.findUnique({
      where: { studentId_lessonId: { studentId, lessonId: attendanceCode.lessonId } },
    });
    if (already) throw new BadRequestException('Already marked for this lesson');

    return this.prisma.attendanceRecord.create({
      data: { studentId, lessonId: attendanceCode.lessonId, attendanceCodeId: attendanceCode.id },
    });
  }

  async getRecords(lessonId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: { lessonId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { markedAt: 'asc' },
    });
  }
}
