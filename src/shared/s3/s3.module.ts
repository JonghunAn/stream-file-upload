import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  providers: [{ provide: S3Service.name, useClass: S3Service }],
  exports: [{ provide: S3Service.name, useClass: S3Service }],
})
export class S3Module {}
