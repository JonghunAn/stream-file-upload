import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Module({
  providers: [{ provide: UserRepository.name, useClass: UserRepository }],
  exports: [{ provide: UserRepository.name, useClass: UserRepository }],
})
export class UserModule {}
