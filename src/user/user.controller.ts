import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  AbilityFactory,
  Action,
} from '../ability/ability.factory/ability.factory';

//Represent As A DB
export const user = { id: 1, isAdmin: false };
export const user1 = { id: 1, isAdmin: true };
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private abilityFactory: AbilityFactory,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const ability = this.abilityFactory.defineAbility(user);
    const isAllowed = ability.can(Action.Create, user);
    if (!isAllowed) {
      throw new ForbiddenException('only admin!!');
    }
    return this.userService.create(createUserDto);
  }
}
