import { BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { GDBResponse } from '../interface/gdb-response.interface';

export const throwInternalError = (error: Error): void => {
  let errMsg: string;
  if (error instanceof Error) {
    errMsg = error.message;
  }
  errMsg = JSON.stringify(error);
  throw new HttpException(errMsg, 500);
};

export const changeToHttpException = <T>(res: GDBResponse<T>): T => {
  if (!res.code || (!res.response && typeof res.response !== 'boolean' && !res.error)) {
    throw new InternalServerErrorException('GDB response is invalid');
  }
  if (res.code !== 'OK') {
    if (!res.error) {
      throw new InternalServerErrorException('Empty error response');
    } else {
      if (res.code === 'INTERNAL_ERROR') {
        throw new InternalServerErrorException(res.error);
      } else {
        throw new BadRequestException(res.error, res.code);
      }
    }
  } else {
    if (typeof res.response !== 'boolean' && !res.response) {
      throw new InternalServerErrorException('Empty response');
    }
  }
  return res.response;
};
