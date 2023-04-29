import { MessageType } from '../constant/message.enum';

export class Message {
  timestamp!: number;
  type!: MessageType;
  publisherDID!: string;
  receiverDID!: string[];
  data!: string;
}
