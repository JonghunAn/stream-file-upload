import { alarmColors } from '../../shared/slack/constant/constant';
import { ISlackMessageFormat } from 'src/shared/slack/interface/request.interface';
import { ISlackService } from 'src/shared/slack/interface/slack.service.interface';
import { HttpException } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { getConfigData } from './config.util';
import { ConfigData } from 'src/common/constant/config-data.enum';

export const errorAlarm = (
  error: HttpException | Error,
  slackService: ISlackService,
  extra: Record<string, string> = {}
) => {
  const logLevel = checkLogLevel(error);
  const NODE_ENV = getConfigData(ConfigData.NODE_ENV);

  if (NODE_ENV === 'production' || (NODE_ENV === 'development' && JSON.parse(getConfigData(ConfigData.QA_PERIOD)))) {
    Sentry.configureScope(scope => {
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      scope.setLevel(logLevel);
      Sentry.captureException(error);
    });
  } else {
    if (NODE_ENV === 'development' && logLevel === 'error') {
      const errMsg: ISlackMessageFormat = {
        color: alarmColors.error,
        title: 'socket server error',
        fields: [
          {
            value: `\`\`\`message: ${error.message}\n\nstack: ${error.stack}\`\`\``,
          },
        ],
      };
      slackService.sendSlackMessage(errMsg);
    }
  }
};

const checkLogLevel = (error: HttpException | Error) => {
  if (error instanceof HttpException && error.getStatus?.() < 500) {
    return 'log';
  } else {
    return 'error';
  }
};
