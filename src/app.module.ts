import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AbilityModule } from './ability/ability.module';

@Module({
  imports: [UserModule, AbilityModule],
})
export class AppModule {}
