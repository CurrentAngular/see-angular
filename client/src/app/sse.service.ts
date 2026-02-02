import { Injectable } from '@angular/core';
import { Observable, share, map } from 'rxjs';
import { EventsSource } from './sse.interface';

/**
 * Сервис выступает в роли умного диспетчера соединений. Он гарантирует, что: 

    Соединение одно на всё приложение
    Данные корректно преобразуются из JSON в объекты
    При обрыве связи не "убивается" поток, а происходит автоматическое восстановление
    При отсутствии слушателей соединение корректно закрывается
 */

@Injectable({
  providedIn: 'root',
})
export class SseService {
  private baseUrl = 'http://localhost:3000';

  private eventSource$: Observable<EventsSource> | null = null;

  getEvents(): Observable<EventsSource> {
    // Проверяет, существует ли уже активный поток
    // Это предотвращает создание множества подключений к серверу
    // Если вы вызовете getEvents() в нескольких компонентах или несколько раз в одном компоненте, сервис не будет открывать новые соединения
    // Он вернет существующий поток
    // Это паттерн Singleton внутри сервиса
    if (!this.eventSource$) {
      // Конструктор new Observable позволяет создать адаптер
      // Внутри него мы создаем физическое соединение new EventSource(...), а затем вручную переводим события из eventSource в observer.next(...)
      this.eventSource$ = new Observable<EventsSource>((observer) => {
        const eventSource = new EventSource(`${this.baseUrl}/api/event`, {
          withCredentials: true, // ВАЖНО: отправляем куки с запросом
        });

        // Обработка входящих данных (onmessage)
        eventSource.onmessage = (event: MessageEvent) => {
          // Сервис пытается распарсить строку через JSON.parse
          try {
            // Если успешно — отправляет объект в поток RxJS (observer.next)
            const parsedData = JSON.parse(event.data);
            observer.next(parsedData);
          } catch (e) {
            // Если ошибка (например, сервер отправил обычный текст) — оборачивает текст в структуру { data: ... }, чтобы сохранить совместимость с интерфейсом EventsSource
            observer.next({ data: event.data });
          }
        };

        // Обработка ошибок и переподключение (onerror)
        // Если соединение прерывается (например, перезагрузили бэкенд или проблемы с сетью), событие onerror срабатывает
        // Браузерный EventSource имеет встроенный механизм автоматического переподключения (он сам попробует соединиться снова через несколько секунд)
        // Если бы мы вызвали observer.error(error), это завершило бы RxJS поток (убило бы Observable)
        // После этого данные перестали бы приходить навсегда
        // Мы же просто логируем ошибку, позволяя браузеру тихо переподключиться и продолжить отправку данных в observer.next
        eventSource.onerror = (error) => {
          console.error('SSE Connection Error:', error);
          // Если ошибка 401 (нет авторизации), можно обработать
          if (eventSource.readyState === EventSource.CLOSED) {
            observer.error('Connection closed - possibly unauthorized');
          }
        };

        // Если все компоненты, которые слушали этот поток, удалились или отписались, вызывается eventSource.close()
        // Это физически разрывает соединение с сервером, чтобы не тратить ресурсы впустую
        return () => {
          eventSource.close();
        };
      }).pipe(
        // share() делает соединение единым для всех подписчиков
        // resetOnRefCountZero: true закрывает соединение, если все отписались
        // ---
        // Оператор share превращает "холодный" Observable (который создает новое соединение на каждого подписчика) в "горячий" (который делит одно соединение на всех).
        // ---
        //  Параметр resetOnRefCountZero: true:
        //  Это связывает логику getEvents() (которая проверяет null) и оператор share.
        //  Когда кто-то подписывается — соединение открывается.
        //  Когда количество подписчиков падает до 0 (все закрыли вкладки или ушли с роута) — соединение закрывается.
        //  Когда появится новый подписчик — создается новое соединение (так как старое уже закрыто).
        share({ resetOnRefCountZero: true }),
      );
    }

    return this.eventSource$;
  }

  // Сбрасываем подключение (например, после logout)
  resetConnection(): void {
    this.eventSource$ = null;
  }
}
