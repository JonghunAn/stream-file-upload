import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  Headers,
  UseGuards,
  UseInterceptors,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JWSGuard } from 'src/common/guard/jws.guard';
import { TopicService } from './topic.service';
import { ITopicService } from 'src/domain/topic/interface/topic.service.interface';
import { IFileUploadResponse } from 'src/domain/topic/interface/response.interface';
import { MAX_FILE_SIZE } from 'src/domain/topic/constant/max-file-size.constant';

@Controller('api/v1/topics')
export class TopicController {
  constructor(@Inject(TopicService.name) private readonly topicService: ITopicService) {}

  @UseGuards(JWSGuard)
  @Post(':topicDID/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileStream(
    @Param('topicDID') topicDID: string,
    @Headers('Authorization') header: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
      })
    )
    file: Express.MulterS3.File
  ): Promise<IFileUploadResponse> {
    const jws = header.replace('Bearer ', '');
    return await this.topicService.uploadFileStream(file, jws, topicDID);
  }
}
