import { Controller, Get, Post, Body, Req, UseGuards, Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { IsString, IsInt } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

class CreateGroupDto {
  @IsString() name: string;
  @IsInt() course: number;
}

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.group.findMany({ include: { _count: { select: { users: true } } } });
  }

  create(dto: CreateGroupDto) {
    return this.prisma.group.create({ data: dto });
  }
}

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [GroupsController],
  providers: [GroupsService, PrismaService],
})
export class GroupsModule {}
