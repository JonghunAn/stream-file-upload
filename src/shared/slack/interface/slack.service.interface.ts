import { ISlackMessageFormat } from './request.interface';

export interface ISlackService {
  sendSlackMessage(message: ISlackMessageFormat): Promise<void>;
}
