import { randomUUID } from 'crypto';
import { JsonrpcMethod } from '../constant/jsonrpc-method.enum';
import { jsonrpcJWMType } from '../constant/jsonrpc-jwm-type.enum';
import { IFetchTopicsMessagesFilter, IFilter } from 'src/domain/topic/interface/topic.interface';
import { generateJWS } from './util';
import { JSONRPC_V2 } from '../constant/jsonrpc.consatnt';

export type wsKeyPair = {
  x: string;
  y: string;
  d: string;
  did: string;
};

type JWM = {
  id: string;
  type: string;
  from: string;
  to: string[];
  created_time: number;
  body?: { message: string };
};

const UUID_PREFIX = 'urn:uuid:';
// NOTE : example
const jwmPayloadType = 'https://localhost.io//1.0/';

export const generateCreateTopicMessage = async (
  userDID: wsKeyPair,
  topicDID: wsKeyPair,
  subDID: wsKeyPair,
  requestId: string
): Promise<{ message: string; data: string }> => {
  const payload = generateJWMPayload(jsonrpcJWMType.CREATE_TOPIC, subDID.did, [topicDID.did]);
  const data = await generateJWS(subDID.x, subDID.y, subDID.d, subDID.did, payload);
  const params = { userDID: userDID.did, subDID: subDID.did, topicDID: topicDID.did, data };
  return { message: generateWsMessage(JsonrpcMethod.CREATE_TOPIC, requestId, params), data };
};

export const generateCreateInvitationMessage = async (
  userDID: wsKeyPair,
  topicDID: wsKeyPair,
  subDID: wsKeyPair,
  requestId: string,
  messageId: string
): Promise<{ message: string; data: string }> => {
  const payload = generateJWMPayload(jsonrpcJWMType.CREATE_INVITATION, subDID.did, [topicDID.did]);
  const data = await generateJWS(subDID.x, subDID.y, subDID.d, subDID.did, payload);
  const params = {
    userDID: userDID.did,
    subDID: subDID.did,
    topicDID: topicDID.did,
    message: {
      id: messageId,
      data,
    },
  };
  const message = generateWsMessage(JsonrpcMethod.CREATE_INVITATION, requestId, params);
  return { message, data };
};

export const generateVerifyInvitationCodeMessage = (invitationCode: string, requestId: string): string => {
  const params = {
    invitationCode,
  };
  return generateWsMessage(JsonrpcMethod.VERIFY_INVITATION_CODE, requestId, params);
};

export const generateCreateAcceptInvitationMessage = async (
  userDID: wsKeyPair,
  subDID: wsKeyPair,
  invitationCode: string,
  inviterSubDID: wsKeyPair,
  requestId: string,
  messageId: string
): Promise<{ message: string; data: string }> => {
  const payload = generateJWMPayload(jsonrpcJWMType.CREATE_INVITATION, subDID.did, [inviterSubDID.did]);
  const data = await generateJWS(subDID.x, subDID.y, subDID.d, subDID.did, payload);
  const params = {
    userDID: userDID.did,
    subDID: subDID.did,
    invitationCode,
    inviterSubDID: inviterSubDID.did,
    message: {
      id: messageId,
      data,
    },
  };
  const message = generateWsMessage(JsonrpcMethod.ACCEPT_INVITATION, requestId, params);
  return { message, data };
};

export const generatePublishMessagesMessage = async (
  userDID: wsKeyPair,
  subDID: wsKeyPair,
  topicDID: wsKeyPair,
  messageCount: number,
  requestId: string
): Promise<[any, string[]]> => {
  const JWMs: string[] = [];
  for (let i = 0; i < messageCount; i++) {
    const payload = generateJWMPayload(jsonrpcJWMType.CREATE_INVITATION, subDID.did, [topicDID.did]);
    const jws = await generateJWS(subDID.x, subDID.y, subDID.d, subDID.did, payload);
    JWMs.push(jws);
  }
  const params = {
    userDID: userDID.did,
    subDID: subDID.did,
    data: JWMs,
  };
  const message = generateWsMessage(JsonrpcMethod.PUBLISH_MESSAGES, requestId, params);

  return [message, JWMs];
};

export const generateFetchAllTopicsMessage = (requestId: string, userDID: string, filter: IFilter): string => {
  const params = {
    userDID,
    filter: { ...filter, fromTimestamp: String(filter.fromTimestamp), toTimestamp: String(filter.toTimestamp) },
  };
  return generateWsMessage(JsonrpcMethod.FETCH_ALL_TOPICS_MESSAGES, requestId, params);
};

export const generateFetchTopicsMessages = (
  requestId: string,
  userDID: string,
  filters: IFetchTopicsMessagesFilter[]
): string => {
  const params = {
    userDID,
    filters: filters.map(filter => ({
      ...filter,
      fromTimestamp: String(filter.fromTimestamp),
      toTimestamp: String(filter.toTimestamp),
    })),
  };
  return generateWsMessage(JsonrpcMethod.FETCH_TOPICS_MESSAGES, requestId, params);
};

export const generateRemoveConnectionMessage = (
  userDID: string,
  subDID: string,
  topicDID: string,
  requestId: string,
  message: { id: string; data: string }
): string => {
  const params = { userDID, subDID, topicDID, message };
  return generateWsMessage(JsonrpcMethod.REMOVE_CONNECTION, requestId, params);
};

export const generateFetchUserInfoMessage = (requestId: string, userDID: string): string => {
  const params = { userDID };
  return generateWsMessage(JsonrpcMethod.FETCH_USER_INFO, requestId, params);
};

export const generateWsMessage = (event: JsonrpcMethod, requestId: string, params: any): string => {
  return JSON.stringify({ event, data: { jsonrpc: JSONRPC_V2, id: requestId, method: event, params } });
};

const generateJWMPayload = (messageType: string, from: string, to: string[], message?: string): JWM => {
  message ??= '';
  return {
    id: UUID_PREFIX + randomUUID(),
    type: jwmPayloadType + messageType,
    from,
    to,
    created_time: Date.now(),
    body: message ? { message } : undefined,
  };
};
