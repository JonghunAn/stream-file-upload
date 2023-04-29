export interface GDBResponse<T> {
  code: 'OK';
  response?: T;
  error?: string;
}
