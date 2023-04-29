import { generateDID, generateJWS } from 'test/util/util';
import { verifyJWS } from './jws.util';

describe('tests jws verification', () => {
  const testCount = 100;
  let errorCount = 0;
  let correctCount = 0;
  let payload;
  it('tests jws verification', async () => {
    for (let i = 0; i < testCount; i++) {
      try {
        const did = generateDID();
        const jws = await generateJWS(did.x, did.y, did.d, did.did, { dummy: 'dummy' });
        const res = await verifyJWS(jws);
        payload = res.payload;
        const _payload = JSON.parse(payload);
        if (_payload.dummy === 'dummy') {
          correctCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }
    expect(correctCount).toBe(testCount);
    expect(errorCount).toBe(0);
  });
});
