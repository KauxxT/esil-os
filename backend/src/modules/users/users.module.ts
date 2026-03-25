import { Controller, Get, Req, UseGuards, Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { group: true },
    });
    const subjects = user?.groupId
      ? await this.prisma.lesson.findMany({
          where: { groupId: user.groupId },
          select: { subjectName: true, teacher: { select: { name: true } } },
          distinct: ['subjectName'],
        })
      : [];
    return { ...user, passwordHash: undefined, subjects };
  }
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.id);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
