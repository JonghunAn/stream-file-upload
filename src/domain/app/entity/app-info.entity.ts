export class AppInfo {
  version!: number;
  platformType!: PlatformType;
  secret!: string;
}

export const platformType = {
  IOS: 'IOS',
  ANDROID: 'ANDROID',
} as const;

export type PlatformType = typeof platformType[keyof typeof platformType];
