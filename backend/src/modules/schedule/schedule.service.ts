import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async getLessons(user: any, groupId?: string, date?: string, week?: string) {
    let targetGroupId = groupId;

    if (user.role === 'STUDENT' && !targetGroupId) {
      const u = await this.prisma.user.findUnique({ where: { id: user.id } });
      targetGroupId = u?.groupId;
    }

    const where: any = {};
    if (user.role === 'TEACHER') {
      where.teacherId = user.id;
    } else if (targetGroupId) {
      where.groupId = targetGroupId;
    }

    if (date) {
      const d = new Date(date);
      where.dayOfWeek = d.getDay();
    }

    return this.prisma.lesson.findMany({
      where,
      include: {
        teacher: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(dto: CreateLessonDto, teacherId: string) {
    return this.prisma.lesson.create({
      data: { ...dto, teacherId, startTime: new Date(dto.startTime), endTime: new Date(dto.endTime) },
    });
  }

  async update(id: string, dto: UpdateLessonDto, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException();
    if (lesson.teacherId !== teacherId) throw new ForbiddenException();

    const data: any = { ...dto };
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);

    return this.prisma.lesson.update({ where: { id }, data });
  }

  async delete(id: string, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException();
    if (lesson.teacherId !== teacherId) throw new ForbiddenException();
    return this.prisma.lesson.delete({ where: { id } });
  }
}
