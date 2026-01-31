// Интерфейс для данных, которые приходят с сервера (строка)
interface SseServerEvent {
  data: string;
}

// Интерфейс для распарсенных данных
export interface EventsSource {
  data: string;
}
