import { ObjectSchema } from 'joi';
import { BadRequestException } from '@nestjs/common';

export const jsonParseValidate = async <TSchema>(
  jsonString: string,
  schema: ObjectSchema<TSchema>
): Promise<TSchema> => {
  const result = schema.validate(JSON.parse(jsonString));
  if (result.error) {
    throw new BadRequestException(result.error.message);
  }
  return result.value;
};
