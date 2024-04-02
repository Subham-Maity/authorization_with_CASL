import { Injectable, Logger } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import {
  PureAbility,
  AbilityBuilder,
  createMongoAbility,
  InferSubjects,
  ExtractSubjectType,
} from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<typeof User> | 'all';
export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    Logger.debug(can, cannot, build + 'ability');

    if (user.isAdmin) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, User);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
