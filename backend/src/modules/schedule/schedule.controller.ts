import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateLessonDto, UpdateLessonDto } from './schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  getLessons(
    @Req() req,
    @Query('groupId') groupId?: string,
    @Query('date') date?: string,
    @Query('week') week?: string,
  ) {
    return this.scheduleService.getLessons(req.user, groupId, date, week);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  create(@Body() dto: CreateLessonDto, @Req() req) {
    return this.scheduleService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto, @Req() req) {
    return this.scheduleService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  delete(@Param('id') id: string, @Req() req) {
    return this.scheduleService.delete(id, req.user.id);
  }
}
