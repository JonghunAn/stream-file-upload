export interface IS3Service {
  uploadFile(file: Express.Multer.File, filePath: string): Promise<FileUrl>;
}

export type FileUrl = string;
