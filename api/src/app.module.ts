import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: 'YOUR_SECRET_KEY', // В продакшене используйте переменные окружения!
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [JwtAuthGuard],
})
export class AppModule {}
