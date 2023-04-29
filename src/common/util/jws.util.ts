import { PublicKey } from 'eosjs/dist/PublicKey';
import * as jose from 'jose';
import secp256k1 from 'secp256k1';
import { addPreZeroPadding } from 'src/common/util/util';

export const verifyJWS = async (
  jws: string
): Promise<{
  payload: string;
  protectedHeader: jose.CompactJWSHeaderParameters;
}> => {
  try {
    const decoder = new TextDecoder();
    const crv = 'secp256k1';
    const kty = 'EC';
    const alg = 'ES256K';
    const jwsHeader = jws.split('.')[0];
    const decodedJWSHeader: Uint8Array = jose.base64url.decode(jwsHeader);
    const _decodedJWSHeader: { alg: string; kid: string } = JSON.parse(decodedJWSHeader.toString());
    const encodedPublicKey = _decodedJWSHeader.kid.split(':')[3];
    const publicKey: PublicKey = PublicKey.fromString(encodedPublicKey);
    const _publicKey = publicKey.toElliptic().getPublic();
    const __x = _publicKey.getX().toArrayLike(Buffer);
    const __y = _publicKey.getY().toArrayLike(Buffer);
    const _x = jose.base64url.encode(__x);
    const _y = jose.base64url.encode(__y);
    const pubJwk: Uint8Array | jose.KeyLike = await jose.importJWK(
      {
        crv,
        kty,
        x: _x,
        y: _y,
      },
      alg
    );
    const { payload, protectedHeader } = await jose.compactVerify(jws, pubJwk);
    const _payload: string = decoder.decode(payload);
    return { payload: _payload, protectedHeader };
  } catch (error) {
    throw new Error(
      error instanceof Error ? `Error when verifying JWS : ${error.message}` : `Error when verifying JWS`
    );
  }
};

export const verifyPublicDID = (did: string): boolean => {
  const publicKey: PublicKey = PublicKey.fromString(did.split(':')[3]);
  const _publicKey = publicKey.toElliptic().getPublic();
  const __x: Buffer = addPreZeroPadding(_publicKey.getX().toBuffer(), 32);
  const __y: Buffer = addPreZeroPadding(_publicKey.getY().toBuffer(), 32);
  const pubKey = Buffer.concat([new Uint8Array([4]), __x, __y]);
  try {
    return secp256k1.publicKeyVerify(pubKey);
  } catch (error) {
    return false;
  }
};

export const decodeInfraDID = (did: string): { crv: string; kid: string; kty: string; x: string; y: string } => {
  const publicKey: PublicKey = PublicKey.fromString(did.split(':')[3]);
  const _publicKey = publicKey.toElliptic().getPublic();
  const x: Buffer = addPreZeroPadding(_publicKey.getX().toBuffer(), 32);
  const y: Buffer = addPreZeroPadding(_publicKey.getY().toBuffer(), 32);
  const _x = jose.base64url.encode(x);
  const _y = jose.base64url.encode(y);
  return { crv: 'secp256k1', kty: 'EC', kid: did, x: _x, y: _y };
};
