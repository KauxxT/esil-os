import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CertificatesService, CreateCertificateDto, UpdateCertificateStatusDto } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get()
  getAll(@Req() req) {
    return this.certificatesService.getAll(req.user);
  }

  @Post()
  create(@Body() dto: CreateCertificateDto, @Req() req) {
    return this.certificatesService.create(dto, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCertificateStatusDto, @Req() req) {
    return this.certificatesService.updateStatus(id, dto, req.user);
  }
}
