import { WebSocket } from 'ws';
import { ONE_DAY_IN_MILLIS } from '../../src/common/constant/timestamp.constant';
import { JsonrpcMethod } from '../constant/jsonrpc-method.enum';
import { ec as EC } from 'elliptic';
import { randomBytes } from 'crypto';
import secp256k1 from 'secp256k1';
import { PublicKey } from 'eosjs/dist/PublicKey';
import { Numeric } from 'eosjs';
import * as jose from 'jose';
import { TextEncoder } from 'util';
import { base64url } from 'jose';
import { addPreZeroPadding } from 'src/common/util/util';
import { JSONRPC_V2 } from '../constant/jsonrpc.consatnt';

type JWS = string;

export const createAuthenticatedSocket = async (
  httpServer: any,
  keyPair: any,
  additionalPath = ''
): Promise<WebSocket> => {
  const client: WebSocket = new WebSocket(`ws://127.0.0.1:${httpServer.address().port}${additionalPath}`);
  const authMsg: any = await new Promise<any>((resolve, reject) => {
    client.on('open', async () => {
      client.once('message', data => {
        const res: any = JSON.parse(data.toString());
        if (res.method !== JsonrpcMethod.NOTIFY_AUTH_CHALLENGE) {
          reject(`The first message method should be ${JsonrpcMethod.NOTIFY_AUTH_CHALLENGE}.`);
          return;
        }
        resolve(res);
      });
    });
  });
  const { message } = await generateAuthenticateMessage(authMsg, keyPair);
  await new Promise<void>((resolve, reject) => {
    client.send(JSON.stringify(message));
    client.once('message', data => {
      const res: any = JSON.parse(data.toString());
      if (res.error) {
        reject(res.error);
        return;
      } else if (res.result?.userDID !== keyPair.did) {
        reject('The authentication result is not valid.');
        return;
      }
      resolve();
    });
  });
  return client;
};

export const generateRequestId = () => {
  return Math.floor(Math.random() * 1000).toString();
};

export const appendMonthToTimestamp = (ts: number, monthsToAdd: number): number => {
  if (monthsToAdd % 12 === 0) {
    return (monthsToAdd / 12) * 365 * ONE_DAY_IN_MILLIS + ts;
  }
  return ts + ONE_DAY_IN_MILLIS * 30 * monthsToAdd;
};

export const generateDID = (): {
  x: string;
  y: string;
  d: string;
  did: string;
} => {
  const ecSecp256k1 = new EC('secp256k1');
  let privKey: Buffer;
  do {
    privKey = randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privKey));
  const pubKey: Uint8Array = secp256k1.publicKeyCreate(privKey, false);
  const pubKeyX: Uint8Array = pubKey.slice(1, 33);
  const pubKeyY: Uint8Array = pubKey.slice(33, 65);
  const networkId = '01';
  const encodedPublicKey = PublicKey.fromElliptic(
    ecSecp256k1.keyFromPublic(pubKey),
    Numeric.KeyType.k1,
    ecSecp256k1
  ).toString();
  const did = `did:infra:${networkId}:${encodedPublicKey}`;
  const x = Buffer.from(pubKeyX).toString('base64url');
  const y = Buffer.from(pubKeyY).toString('base64url');
  const d = Buffer.from(privKey).toString('base64url');
  return { x, y, d, did };
};

export const generateJWS = async (x: string, y: string, d: string, did: string, payload: any): Promise<JWS> => {
  const _payload = payload;

  const privJwk = await jose.importJWK(
    {
      crv: 'secp256k1',
      kty: 'EC',
      x,
      y,
      d,
    },
    'ES256K'
  );
  const payloadStr = JSON.stringify(_payload);
  const utf8PayloadStr: Uint8Array = new TextEncoder().encode(payloadStr);
  const jws = await new jose.CompactSign(utf8PayloadStr)
    .setProtectedHeader({
      alg: 'ES256K',
      typ: 'JWM',
      kid: did,
    })
    .sign(privJwk);
  return jws;
};

const decodeBase64urlJson = (base64urlStr: string): any => {
  return JSON.parse(new TextDecoder().decode(Buffer.from(base64url.decode(base64urlStr))));
};

export const generateAuthenticateMessage = async (
  msg: any,
  keyPair: { x: string; y: string; d: string; did: string }
) => {
  let exp;
  const { x, y, d, did } = keyPair;
  if (msg?.params?.challenge) {
    exp = decodeBase64urlJson(msg.params.challenge).exp;
  }
  const jws = await generateJWS(x, y, d, did, {
    method: JsonrpcMethod.AUTHENTICATE_USER_DID,
    exp,
    userDID: did,
    challenge: msg.params.challenge,
    secret: 'cb3b3937fb28cfcdc5db2d017ea1eef406b80c883f45aabb8af110a2652485fb',
  });
  return {
    message: {
      event: JsonrpcMethod.AUTHENTICATE_USER_DID,
      data: {
        jsonrpc: JSONRPC_V2,
        id: Math.floor(Math.random() * 10).toString(),
        method: JsonrpcMethod.AUTHENTICATE_USER_DID,
        params: { data: jws },
      },
    },
  };
};

export const generateNextPubKey = (did: string): { crv: string; kid: string; kty: string; x: string; y: string } => {
  const publicKey: PublicKey = PublicKey.fromString(did.split(':')[3]);
  const _publicKey = publicKey.toElliptic().getPublic();
  const x: Buffer = addPreZeroPadding(_publicKey.getX().toBuffer(), 32);
  const y: Buffer = addPreZeroPadding(_publicKey.getY().toBuffer(), 32);
  const _x = jose.base64url.encode(x);
  const _y = jose.base64url.encode(y);
  return { crv: 'secp256k1', kty: 'EC', kid: did, x: _x, y: _y };
};
