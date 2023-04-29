import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import Joi from 'joi';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { getConfigData } from 'src/common/util/config.util';
import { ConfigData } from 'src/common/constant/config-data.enum';
import { AppModule } from 'src/app.module';
import { UserRepository } from 'src/domain/user/user.repository';
import { TopicRepository } from 'src/domain/topic/topic.repository';
import { generateCreateTopicMessage } from './util/message.factory';
import { generateDID, generateJWS } from './util/util';
import { RedisService } from 'src/shared/redis/redis.service';
import { Secret } from 'src/shared/redis/interface/response.interface';

describe('file upload (e2e)', () => {
  let app: INestApplication;
  let userDID;
  let topicDID;
  let subDID;
  let validJWS: string;
  let expiredJWS: string;
  let requestUrl: string;
  let userRepository: UserRepository;
  let topicRepository: TopicRepository;
  let redisService: RedisService<Secret[]>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${getConfigData(ConfigData.NODE_ENV)}.env`,
          validationSchema: Joi.object({
            NODE_ENV: Joi.valid('test'),
            AWS_ACCESS_KEY_ID: Joi.string().required(),
            AWS_SECRET_ACCESS_KEY: Joi.string().required(),
            AWS_S3_BUCKET_NAME: Joi.string().required(),
            AWS_S3_BUCKET_REGION: Joi.string().required(),
            AWS_S3_URL: Joi.string().required(),
            APP_SECRET: Joi.string().required(),
          }),
        }),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userRepository = app.get(UserRepository.name);
    topicRepository = app.get(TopicRepository.name);
    redisService = app.get(RedisService.name);

    const cachingKeyEnum = {
      APP_SECRET: 'appSecret',
    } as const;

    const appSecrets = await redisService.getData(cachingKeyEnum.APP_SECRET);
    if (!appSecrets) {
      await redisService.setData(cachingKeyEnum.APP_SECRET, [process.env.APP_SECRET]);
    }

    userDID = generateDID();
    topicDID = generateDID();
    subDID = generateDID();

    await userRepository.createUser(userDID.did, '');
    await topicRepository.createTopic(
      topicDID.did,
      subDID.did,
      userDID.did,
      '1',
      (
        await generateCreateTopicMessage(userDID, topicDID, subDID, '1')
      ).data
    );

    validJWS = await generateJWS(userDID.x, userDID.y, userDID.d, userDID.did, {
      exp: '1769792835227',
      method: 'upload_file',
      userDID: userDID.did,
      topicDID: topicDID.did,
      subDID: subDID.did,
      secret: process.env.APP_SECRET,
    });
    expiredJWS = await generateJWS(userDID.x, userDID.y, userDID.d, userDID.did, {
      exp: '1669792835227',
      method: 'upload_file',
      userDID: userDID.did,
      subDID: subDID.did,
      topicDID: topicDID.did,
      secret: process.env.APP_SECRET,
    });
    requestUrl = `/api/v1/topics/${topicDID.did}/file`;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST upload general file', async () => {
    const result = await request(app.getHttpServer())
      .post(requestUrl)
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', `Bearer ${validJWS}`)
      .attach('file', './test/file/test.jpeg')
      .expect(201);

    const fileUrl: string[] = result.body.fileUrl.split('/');
    expect(fileUrl.pop()).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
    expect(fileUrl.pop()).toEqual('original');
    expect(result.body.fileUrl).toContain(getConfigData(ConfigData.AWS_S3_URL));
  });

  it('POST fail  upload  file due to except jws', async () => {
    const result = await request(app.getHttpServer())
      .post(requestUrl)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', './test/file/test.jpeg')
      .expect(401);

    expect(result.body.message).toEqual('Missing Authorization Header');
  });

  it('POST fail  upload  file due to expired jws', async () => {
    const result = await request(app.getHttpServer())
      .post(requestUrl)
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', `Bearer ${expiredJWS}`)
      .attach('file', './test/file/test.jpeg')
      .expect(401);

    expect(result.body.message).toEqual('Expired JWS');
  });

  it('POST fail upload general file due to file size', async () => {
    const result = await request(app.getHttpServer())
      .post(requestUrl)
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', `Bearer ${validJWS}`)
      .field('type', 'original')
      .attach('file', './test/file/test-bulk-fail-size.pdf')
      .expect(413);

    expect(result.body.message).toEqual('Payload Too Large');
  });
});
