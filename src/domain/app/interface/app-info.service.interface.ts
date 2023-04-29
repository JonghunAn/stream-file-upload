export interface IAppInfoService {
  validateSecret(secret: string): Promise<boolean>;
}
