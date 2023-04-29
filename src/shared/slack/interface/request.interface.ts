export interface ISlackMarkDownFormat {
  title?: string;
  value: string;
}

export interface ISlackMessageFormat {
  color: string;
  title: string;
  fields?: ISlackMarkDownFormat[];
  footer?: string;
}

export interface ISlackMessage {
  markdown: boolean;
  attachments: ISlackMessageFormat[];
}
