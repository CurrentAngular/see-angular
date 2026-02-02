import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS для работы с куками и SSE
  app.enableCors({
    origin: 'http://localhost:4200', // Адрес клиентского приложения
    credentials: true, // Разрешаем отправку куков,
  });

  // Подключаем cookie-parser для работы с куками
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
