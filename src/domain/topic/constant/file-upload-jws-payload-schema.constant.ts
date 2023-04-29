import Joi from 'joi';
import { IFileUploadJWSPayload } from 'src/domain/topic/interface/file-upload-jws-payload.interface';

export const fileUploadJWSPayloadSchema = Joi.object<IFileUploadJWSPayload>().keys({
  method: Joi.string().required().equal('upload_file'),
  exp: Joi.string().required(),
  secret: Joi.string().required(),
  userDID: Joi.string()
    .required()
    .pattern(new RegExp(/did:infra:01:PUB_K1_[a-zA-Z\d]{50}/)),
  subDID: Joi.string()
    .required()
    .pattern(new RegExp(/did:infra:01:PUB_K1_[a-zA-Z\d]{50}/)),
  topicDID: Joi.string()
    .required()
    .pattern(new RegExp(/did:infra:01:PUB_K1_[a-zA-Z\d]{50}/)),
});
