import { Controller, Sse } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';

export interface EventsSource {
  data: string;
}

@Controller('api')
export class AppController {
  @Sse('event')
  eventsSource(): Observable<EventsSource> {
    return interval(1000).pipe(
      map((i: number) => {
        return {
          data: `event ${i}`,
        };
      }),
    );
  }
}
