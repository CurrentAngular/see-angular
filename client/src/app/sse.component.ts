import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SseService } from './sse.service';
import { scan, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventsSource } from './sse.interface';

@Component({
  selector: 'cl-sse-component',
  template: `
    <div>
      <h2>SSE Events</h2>
      <ul>
        @for (event of events(); track event.data) {
          <li>{{ event.data }}</li>
        }
      </ul>
    </div>
  `,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SseComponent {
  readonly #sseService = inject(SseService);

  readonly events = toSignal(
    this.#sseService.getEvents().pipe(
      scan((acc: EventsSource[], event: EventsSource) => [...acc, event], []),
      startWith([] as EventsSource[]),
    ),
  );
}
