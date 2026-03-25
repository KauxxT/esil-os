import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto, UpdateStatusDto } from './assignments.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async getAssignments(user: any, groupId?: string) {
    let targetGroupId = groupId;

    if (user.role === 'STUDENT' && !targetGroupId) {
      const u = await this.prisma.user.findUnique({ where: { id: user.id } });
      targetGroupId = u?.groupId;
    }

    const where: any = {};
    if (user.role === 'TEACHER') where.teacherId = user.id;
    else if (targetGroupId) where.groupId = targetGroupId;

    const assignments = await this.prisma.assignment.findMany({
      where,
      include: {
        teacher: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
        statuses: user.role === 'STUDENT'
          ? { where: { studentId: user.id } }
          : true,
      },
      orderBy: { deadline: 'asc' },
    });

    return assignments;
  }

  async create(dto: CreateAssignmentDto, teacherId: string) {
    const assignment = await this.prisma.assignment.create({
      data: { ...dto, teacherId, deadline: new Date(dto.deadline) },
    });

    // Create notifications for all students in group
    const students = await this.prisma.user.findMany({
      where: { groupId: dto.groupId, role: 'STUDENT' },
    });

    await this.prisma.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        type: 'NEW_ASSIGNMENT',
        title: 'Новое задание',
        body: `Преподаватель добавил задание: ${dto.title}`,
      })),
    });

    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException();
    if (assignment.teacherId !== teacherId) throw new ForbiddenException();

    const data: any = { ...dto };
    if (dto.deadline) data.deadline = new Date(dto.deadline);

    return this.prisma.assignment.update({ where: { id }, data });
  }

  async delete(id: string, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException();
    if (assignment.teacherId !== teacherId) throw new ForbiddenException();
    return this.prisma.assignment.delete({ where: { id } });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, studentId: string) {
    return this.prisma.assignmentStatus.upsert({
      where: { assignmentId_studentId: { assignmentId: id, studentId } },
      create: { assignmentId: id, studentId, status: dto.status },
      update: { status: dto.status },
    });
  }
}
