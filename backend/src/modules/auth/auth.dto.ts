import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(['STUDENT', 'TEACHER'])
  role: 'STUDENT' | 'TEACHER';
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
