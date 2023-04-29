export interface IAppVersionService {
  validateSecret(secret: string): Promise<boolean>;
}
