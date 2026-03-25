import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getAll(@Req() req) {
    return this.notificationsService.getNotifications(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req) {
    return this.notificationsService.markRead(id, req.user.id);
  }
}
