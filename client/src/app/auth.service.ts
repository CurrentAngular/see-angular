import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SseService } from './sse.service';

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #http = inject(HttpClient);
  readonly #sseService = inject(SseService);
  readonly #baseUrl = 'http://localhost:3000';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.#http.post<LoginResponse>(
      `${this.#baseUrl}/api/auth/login`,
      { username, password },
      { withCredentials: true }, // ВАЖНО: отправляем и получаем куки
    );
  }

  logout(): Observable<{ message: string }> {
    return this.#http
      .post<{ message: string }>(`${this.#baseUrl}/api/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          // Сбрасываем SSE подключение после logout
          this.#sseService.resetConnection();
        }),
      );
  }
}
