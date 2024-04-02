import { Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory/ability.factory';

@Module({
  imports: [AbilityModule],
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {}
