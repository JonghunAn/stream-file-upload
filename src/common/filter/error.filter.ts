import { HttpStatus, Inject, Logger } from '@nestjs/common';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { errorAlarm } from 'src/common/util/error-alarm.util';
import { ISlackService } from 'src/shared/slack/interface/slack.service.interface';
import { SlackService } from 'src/shared/slack/slack.service';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  constructor(@Inject(SlackService.name) private readonly slackService: ISlackService) {}

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    Logger.error(error.message, error.stack, ErrorFilter.name);
    errorAlarm(error, this.slackService);

    res.status(statusCode).json({
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: error.message,
    });
  }
}
