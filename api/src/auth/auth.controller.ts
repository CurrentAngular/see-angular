import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post('login')
  login(
    @Body() loginDto: { username: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    // В реальном приложении здесь должна быть проверка пользователя в БД
    // Это упрощенный пример!
    if (loginDto.username === 'admin' && loginDto.password === 'password') {
      const payload = {
        id: 1,
        username: loginDto.username,
        email: 'admin@example.com',
      };

      const token = this.jwtService.sign(payload);

      // Устанавливаем JWT в httpOnly куку
      response.cookie('access_token', token, {
        httpOnly: true, // Защита от XSS
        secure: false, // В продакшене должно быть true (только HTTPS)
        sameSite: 'strict', // Защита от CSRF
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
      });

      return {
        message: 'Login successful',
        user: payload,
      };
    }

    return response.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Invalid credentials',
    });
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logout successful' };
  }
}
