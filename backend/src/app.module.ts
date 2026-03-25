import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModuleNest } from './modules/schedule/schedule.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    ScheduleModuleNest,
    AssignmentsModule,
    AttendanceModule,
    NotificationsModule,
    CertificatesModule,
    UsersModule,
    GroupsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
