import { IsString, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  groupId: string;

  @IsDateString()
  deadline: string;
}

export class UpdateAssignmentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}

export class UpdateStatusDto {
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'DONE'])
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
}
