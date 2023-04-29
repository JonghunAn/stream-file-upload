import { S3Client } from '@aws-sdk/client-s3';
import { PayloadTooLargeException, Logger } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import multerS3 from 'multer-s3';
import { ConfigData } from 'src/common/constant/config-data.enum';
import { getConfigData } from 'src/common/util/config.util';
import { fileTypeEnum } from 'src/domain/topic/constant/file-type.enum';
import { MAX_FILE_SIZE } from 'src/domain/topic/constant/max-file-size.constant';
import { S3_MAX_RETRIES } from 'src/shared/s3/constant/s3.constant';

export const streamMulterOption = (): MulterOptions => {
  const s3 = new S3Client({
    region: getConfigData(ConfigData.AWS_S3_BUCKET_REGION),
    maxAttempts: S3_MAX_RETRIES,
    credentials: {
      accessKeyId: getConfigData(ConfigData.AWS_ACCESS_KEY_ID),
      secretAccessKey: getConfigData(ConfigData.AWS_SECRET_ACCESS_KEY),
    },
  });

  const multerOptions: MulterOptions = {
    storage: multerS3({
      s3,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      bucket: getConfigData(ConfigData.AWS_S3_BUCKET_NAME),
      key(req, file, done) {
        const topicDID = file.originalname.replace(/\.[^/.]+$/, '');
        done(null, `${topicDID}/${fileTypeEnum.ORIGINAL}/${randomUUID()}`);
      },
    }),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, done) => {
      const shouldAccept = req.headers['content-length'] <= MAX_FILE_SIZE;
      Logger.log('reqeust content-length: ' + req.headers['content-length']);
      Logger.log(`request file max size : ${MAX_FILE_SIZE}}`);
      shouldAccept ? done(null, true) : done(new PayloadTooLargeException(), false);
    },
  };
  return multerOptions;
};
