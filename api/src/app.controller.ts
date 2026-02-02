/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Sse, UseGuards, Req } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

export interface EventsSource {
  data: string;
}

@Controller('api')
export class AppController {
  @UseGuards(JwtAuthGuard) // Защищаем SSE эндпоинт
  @Sse('event')
  eventsSource(@Req() request: any): Observable<EventsSource> {
    const user = request.user; // Получаем данные пользователя из JWT

    return interval(1000).pipe(
      map((i: number) => {
        return {
          data: `User ${user.username} (ID: ${user.id}): event ${i}`,
        };
      }),
    );
  }
}
