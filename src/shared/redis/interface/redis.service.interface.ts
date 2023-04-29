export interface IRedisService<T> {
  getData(key: string): Promise<T | null>;
  setData(key: string, data: any, ttl?: number): Promise<void>;
  deleteData(key: string): Promise<void>;
}
