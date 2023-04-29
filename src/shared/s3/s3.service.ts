import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { ConfigData } from 'src/common/constant/config-data.enum';
import { getConfigData } from 'src/common/util/config.util';
import {
  S3_HTTP_TIMEOUT,
  S3_MAX_RETRIES,
  S3_PART_SIZE,
  S3_QUEUE_SIZE,
  S3_SYNCHRONOUS_UPLOAD_FILE_SIZE_LIMIT,
} from 'src/shared/s3/constant/s3.constant';
import { randomUUID } from 'crypto';
import { FileUrl, IS3Service } from './interface/s3.service.interface';

@Injectable()
export class S3Service implements IS3Service {
  private readonly s3: AWS.S3;
  constructor() {
    AWS.config.update({
      accessKeyId: getConfigData(ConfigData.AWS_ACCESS_KEY_ID),
      secretAccessKey: getConfigData(ConfigData.AWS_SECRET_ACCESS_KEY),
    });
    this.s3 = new AWS.S3({
      region: getConfigData(ConfigData.AWS_S3_BUCKET_REGION),
      maxRetries: S3_MAX_RETRIES,
      httpOptions: { timeout: S3_HTTP_TIMEOUT },
    });
  }

  async uploadFile(file: Express.Multer.File, filePath: string): Promise<FileUrl> {
    const key = `${filePath}/${randomUUID()}`;
    const putObjectRequest: AWS.S3.PutObjectRequest = {
      Bucket: getConfigData(ConfigData.AWS_S3_BUCKET_NAME),
      Key: key,
      Body: file.buffer,
    };
    const isMultiPartUpload: boolean = file.size > S3_SYNCHRONOUS_UPLOAD_FILE_SIZE_LIMIT;
    const multipartUploadOptions: AWS.S3.ManagedUpload.ManagedUploadOptions = {
      partSize: S3_PART_SIZE,
      queueSize: S3_QUEUE_SIZE,
    };

    await this.s3.upload(putObjectRequest, isMultiPartUpload ? multipartUploadOptions : undefined).promise();
    return getConfigData(ConfigData.AWS_S3_URL) + key;
  }
}
