import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AbilityFactory } from '../ability/ability.factory/ability.factory';

@Module({
  controllers: [UserController],
  providers: [UserService, AbilityFactory],
})
export class UserModule {}
