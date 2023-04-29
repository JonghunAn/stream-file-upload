import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TopicRepository } from './topic.repository';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { AppInfoModule } from 'src/domain/app/app-info.module';
import { MulterModule } from '@nestjs/platform-express';
import { streamMulterOption } from 'src/shared/s3/constant/multer-options.constant';
import { S3Module } from '../../shared/s3/s3.module';

@Module({
  imports: [
    UserModule,
    AppInfoModule,
    S3Module,
    MulterModule.registerAsync({
      useFactory: streamMulterOption,
    }),
  ],
  controllers: [TopicController],
  providers: [
    { provide: TopicService.name, useClass: TopicService },
    { provide: TopicRepository.name, useClass: TopicRepository },
  ],
  exports: [
    { provide: TopicRepository.name, useClass: TopicRepository },
    { provide: TopicService.name, useClass: TopicService },
  ],
})
export class TopicModule {}
