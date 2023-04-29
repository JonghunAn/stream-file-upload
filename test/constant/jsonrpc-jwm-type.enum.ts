export const jsonrpcJWMType = {
  CREATE_TOPIC: 'create-topic',
  CREATE_INVITATION: 'create-invitation',
} as const;

export type JsonrpcJWMType = typeof jsonrpcJWMType[keyof typeof jsonrpcJWMType];
