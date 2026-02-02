import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SseService } from './sse.service';
import { AuthService } from './auth.service';
import { scan, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventsSource } from './sse.interface';

@Component({
  selector: 'cl-sse-component',
  standalone: true,
  template: `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>SSE Events (Authenticated)</h2>
        <button (click)="onLogout()">Logout</button>
      </div>
      <ul>
        @for (event of events(); track event.data) {
          <li>{{ event.data }}</li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      button {
        padding: 8px 16px;
        background-color: #dc3545;
        color: white;
        border: none;
        cursor: pointer;
      }
      button:hover {
        background-color: #c82333;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      li {
        padding: 8px;
        margin: 4px 0;
        background-color: #f0f0f0;
        border-radius: 4px;
      }
    `,
  ],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SseComponent {
  readonly #sseService = inject(SseService);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  readonly events = toSignal(
    this.#sseService.getEvents().pipe(
      scan((acc: EventsSource[], event: EventsSource) => [...acc, event], []),
      startWith([] as EventsSource[]),
    ),
    { initialValue: [] },
  );

  onLogout(): void {
    this.#authService.logout().subscribe({
      next: () => {
        this.#router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }
}
