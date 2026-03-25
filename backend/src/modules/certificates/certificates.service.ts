import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCertificateDto {
  @IsEnum(['STUDY_CERTIFICATE', 'CUSTOM_CERTIFICATE'])
  type: 'STUDY_CERTIFICATE' | 'CUSTOM_CERTIFICATE';

  @IsString()
  @IsOptional()
  comment?: string;
}

export class UpdateCertificateStatusDto {
  @IsEnum(['PENDING', 'READY'])
  status: 'PENDING' | 'READY';
}

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async getAll(user: any) {
    if (user.role === 'STUDENT') {
      return this.prisma.certificateRequest.findMany({
        where: { studentId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    }
    // Teacher sees all
    return this.prisma.certificateRequest.findMany({
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateCertificateDto, studentId: string) {
    return this.prisma.certificateRequest.create({
      data: { ...dto, studentId },
    });
  }

  async updateStatus(id: string, dto: UpdateCertificateStatusDto, user: any) {
    if (user.role !== 'TEACHER') throw new ForbiddenException();
    const cert = await this.prisma.certificateRequest.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException();
    return this.prisma.certificateRequest.update({ where: { id }, data: { status: dto.status } });
  }
}
