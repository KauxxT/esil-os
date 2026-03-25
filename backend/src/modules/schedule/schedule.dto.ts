import { IsString, IsUUID, IsInt, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  subjectName: string;

  @IsUUID()
  groupId: string;

  @IsString()
  room: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  dayOfWeek: number;

  @IsEnum(['ODD', 'EVEN', 'BOTH'])
  @IsOptional()
  weekType: 'ODD' | 'EVEN' | 'BOTH' = 'BOTH';
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  subjectName?: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;
}
