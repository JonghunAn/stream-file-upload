import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ITopicService } from './interface/topic.service.interface';
import { IUserRepository } from '../user/interface/user.repository.interface';
import { changeToHttpException } from 'src/common/util/error.util';
import { UserRepository } from '../user/user.repository';
import { IFileUploadResponse } from 'src/domain/topic/interface/response.interface';
import { verifyJWS } from '../../common/util/jws.util';
import { IFileUploadJWSPayload } from 'src/domain/topic/interface/file-upload-jws-payload.interface';
import { fileUploadJWSPayloadSchema } from 'src/domain/topic/constant/file-upload-jws-payload-schema.constant';
import { IAppInfoService } from 'src/domain/app/interface/app-info.service.interface';
import { AppInfoService } from 'src/domain/app/app-info.service';
import { jsonParseValidate } from 'src/common/util/json-parse-validate.util';

@Injectable()
export class TopicService implements ITopicService {
  constructor(
    @Inject(UserRepository.name) private readonly userRepository: IUserRepository,
    @Inject(AppInfoService.name) private appinfoService: IAppInfoService // @Inject(S3Service.name) private readonly s3Service: IS3Service
  ) {}

  async uploadFileStream(file: Express.MulterS3.File, header: string, topicDID: string): Promise<IFileUploadResponse> {
    const { payload: headerPayload } = await verifyJWS(header);
    const payload: Required<IFileUploadJWSPayload> = await jsonParseValidate(headerPayload, fileUploadJWSPayloadSchema);
    await this.uploadFilePayloadValidate(payload, topicDID);

    if (!file) {
      Logger.error('s3 upload file error\n timestamp: ' + Date.now());
      throw new InternalServerErrorException('Fail to  file upload to cloud service');
    }
    return { fileUrl: file.location };
  }

  private async uploadFilePayloadValidate(payload: IFileUploadJWSPayload, requestTopicDID: string): Promise<void> {
    const isSecretValid: boolean = await this.appinfoService.validateSecret(payload.secret);
    if (!isSecretValid) {
      throw new UnauthorizedException('App secret validation has failed');
    }
    const { topicDID } = payload;
    if (topicDID !== requestTopicDID) {
      throw new UnauthorizedException('TopicDID is not matched');
    }
    const response = changeToHttpException(
      await this.userRepository.existsByUserConnectedTopic(payload.userDID, payload.subDID, topicDID)
    );
    if (response === false) {
      throw new BadRequestException('Not found topicDID associated with the userDID');
    }
  }
}
