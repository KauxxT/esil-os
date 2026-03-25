import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Вызывается из /auth/callback на фронтенде после Google OAuth
  // Принимает токен Supabase, создаёт/находит пользователя, возвращает наш JWT
  @Post('google/token')
  googleToken(@Body() body: { access_token: string; user: { email: string; name: string } }) {
    return this.authService.handleGoogleToken(body.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMe(@Req() req) {
    return this.authService.getMe(req.user.id);
  }
}
