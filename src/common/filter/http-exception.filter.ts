import { Catch, ArgumentsHost, HttpStatus, Logger, HttpException, Inject } from '@nestjs/common';
import { Response } from 'express';
import { errorAlarm } from 'src/common/util/error-alarm.util';
import { ISlackService } from 'src/shared/slack/interface/slack.service.interface';
import { SlackService } from 'src/shared/slack/slack.service';

@Catch(HttpException)
export class HttpExceptionFilter {
  constructor(@Inject(SlackService.name) private readonly slackService: ISlackService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const request = ctx.getRequest<Request>();

    if (statusCode >= 500 && statusCode < 600) {
      Logger.error(JSON.stringify(exception, null, 2));
      errorAlarm(exception, this.slackService);
    } else {
      Logger.log(JSON.stringify(exception, null, 2));
    }

    response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
