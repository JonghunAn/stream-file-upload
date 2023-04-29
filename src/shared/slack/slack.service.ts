import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { ConfigData } from 'src/common/constant/config-data.enum';
import { getConfigData } from 'src/common/util/config.util';
import { REAL_SLACK_URL } from './constant/constant';
import { ISlackMessage, ISlackMessageFormat } from './interface/request.interface';
import { ISlackService } from './interface/slack.service.interface';

@Injectable()
export class SlackService implements ISlackService {
  constructor(private httpService: HttpService) {}

  async sendSlackMessage(message: ISlackMessageFormat) {
    if (getConfigData(ConfigData.SLACK_ERR_ALARM_URL) !== REAL_SLACK_URL) {
      return;
    }
    const data: ISlackMessage = {
      markdown: true,
      attachments: [],
    };

    message.footer = `From file-upload ${getConfigData(ConfigData.NODE_ENV)} server`;
    data.attachments.push(message);
    await lastValueFrom(
      this.httpService
        .post(getConfigData(ConfigData.SLACK_ERR_ALARM_URL), data, { timeout: 3000 })
        .pipe(map(res => res.data))
    );
  }
}
