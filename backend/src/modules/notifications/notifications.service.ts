import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // Run every hour to check deadlines
  @Cron(CronExpression.EVERY_HOUR)
  async checkDeadlines() {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const assignments = await this.prisma.assignment.findMany({
      where: { deadline: { gte: now, lte: in24h } },
      include: { group: { include: { users: { where: { role: 'STUDENT' } } } } },
    });

    for (const assignment of assignments) {
      for (const student of assignment.group.users) {
        const done = await this.prisma.assignmentStatus.findUnique({
          where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
        });
        if (done?.status === 'DONE') continue;

        const exists = await this.prisma.notification.findFirst({
          where: { userId: student.id, type: 'DEADLINE_APPROACHING', body: { contains: assignment.id } },
        });
        if (exists) continue;

        await this.prisma.notification.create({
          data: {
            userId: student.id,
            type: 'DEADLINE_APPROACHING',
            title: 'Дедлайн приближается',
            body: `Задание "${assignment.title}" нужно сдать через 24 часа. ID: ${assignment.id}`,
          },
        });
      }
    }
  }
}
