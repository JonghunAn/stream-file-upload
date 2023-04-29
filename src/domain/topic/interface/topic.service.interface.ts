import { IFileUploadResponse } from 'src/domain/topic/interface/response.interface';

export interface ITopicService {
  uploadFileStream(file: Express.MulterS3.File, header: string, topicDID: string): Promise<IFileUploadResponse>;
}
