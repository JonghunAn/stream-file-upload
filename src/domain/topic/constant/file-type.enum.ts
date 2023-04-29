export const fileTypeEnum = {
  ORIGINAL: 'original',
  THUMBNAIL: 'thumbnail',
} as const;
export type FileTypeEnum = typeof fileTypeEnum[keyof typeof fileTypeEnum];
