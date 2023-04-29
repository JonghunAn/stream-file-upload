export interface IFileUploadJWSPayload {
  method: string;
  exp: string;
  userDID: string;
  subDID: string;
  topicDID: string;
  secret: string;
}
