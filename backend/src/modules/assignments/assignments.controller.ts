import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto, UpdateStatusDto } from './assignments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Get()
  getAll(@Req() req, @Query('groupId') groupId?: string) {
    return this.assignmentsService.getAssignments(req.user, groupId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  create(@Body() dto: CreateAssignmentDto, @Req() req) {
    return this.assignmentsService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto, @Req() req) {
    return this.assignmentsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  delete(@Param('id') id: string, @Req() req) {
    return this.assignmentsService.delete(id, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @Req() req) {
    return this.assignmentsService.updateStatus(id, dto, req.user.id);
  }
}
