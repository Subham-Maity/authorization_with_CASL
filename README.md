# Chapter 1

## Code

`user.entity.ts`

```ts
export class User {
  id: number;
  isAdmin: boolean;
}
```
- `src/ability/ability.module.ts`
- `src/ability/ability.factory/ability.factory.ts`
- `ability.factory`

```ts
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
```
`user.contoller.ts`
```ts
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
```

when you call `http://localhost:3000/users` it will return 

```
{
    "message": "only admin!!",
    "error": "Forbidden",
    "statusCode": 403
}
```

## Explain 

The purpose of the `@casl/ability` library is to implement authorization or access control in your application. It allows you to define actions (e.g., `create`, `read`, `update`, `delete`) and subjects (e.g., `User`, `Article`, `Comment`) that represent the entities in your application. By defining these actions and subjects, you can create rules that determine which actions a user (or role) is allowed to perform on specific subjects.

Here's a breakdown of the code you provided, along with explanations and additional examples:

1. **Defining Actions and Subjects**

```typescript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<typeof User> | 'all';
```

In this code snippet, we define an `Action` enum that lists the available actions in our application. We also define a `Subjects` type alias that represents the subjects (entities) in our application. In this case, it includes the `User` entity and the special `'all'` subject, which represents all entities.

The purpose of defining actions and subjects is to create a structured way of representing the permissions in your application. For example, you might want to define rules like "Admins can manage all entities" or "Regular users can only read and update their own profiles."

2. **Creating the AbilityFactory**

```typescript
@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

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
```

The `AbilityFactory` is a service that creates an `AppAbility` instance based on the provided `User` object. The `defineAbility` method uses the `AbilityBuilder` from `@casl/ability` to build the ability instance.

Here's what the `defineAbility` method does:

- If the user is an admin (`user.isAdmin` is true), it grants the `Manage` action for all subjects (`'all'`) using `can(Action.Manage, 'all')`.
- If the user is not an admin, it grants the `Read` action for the `User` subject using `can(Action.Read, User)`.
- Finally, it builds the `AppAbility` instance with the defined rules and a function that detects the subject type (`detectSubjectType`).

The purpose of the `AbilityFactory` is to encapsulate the logic for creating the ability instance based on the user's role or attributes. This makes it easier to manage and update the authorization rules in your application.

3. **Using the AbilityFactory in the Controller**

```typescript
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
```

In the `UserController`, we inject the `AbilityFactory` and use it to create an `AppAbility` instance in the `create` method.

- We call `abilityFactory.defineAbility(user)` to create the ability instance based on the provided `user` object.
- We then use `ability.can(Action.Create, user)` to check if the user is allowed to perform the `Create` action on the `user` subject.
- If the user is not allowed, we throw a `ForbiddenException` with the message "only admin!!".
- If the user is allowed, we proceed with creating a new user by calling `userService.create(createUserDto)`.

The purpose of using the `AbilityFactory` in the controller is to enforce authorization rules before executing sensitive operations in your application. By checking if the user has the required permissions, you can prevent unauthorized access and maintain a secure application.

**Additional Examples**

Here are a few more examples to illustrate how you can define and use abilities with the `@casl/ability` library:

1. **Defining rules based on user roles**

```typescript
defineAbility(user: User) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  if (user.role === 'admin') {
    can(Action.Manage, 'all');
  } else if (user.role === 'editor') {
    can(Action.Create, Article);
    can(Action.Update, Article);
    can(Action.Read, Article);
  } else {
    can(Action.Read, Article);
  }

  // Additional rules...

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
}
```

In this example, we define rules based on the user's role (`admin`, `editor`, or regular user). Admins can manage all entities, editors can create, update, and read articles, and regular users can only read articles.

2. **Defining rules based on object ownership**

```typescript
defineAbility(user: User) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  can(Action.Read, User, { id: user.id }); // Users can read their own profiles
  can(Action.Update, User, { id: user.id }); // Users can update their own profiles

  can(Action.Read, Article); // Users can read all articles
  can(Action.Create, Article, { author: user.id }); // Users can create articles with themselves as authors
  can(Action.Update, Article, { author: user.id }); // Users can update their own articles
  can(Action.Delete, Article, { author: user.id }); // Users can delete their own articles

  // Additional rules...

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
}
```

In this example, we define rules based on object ownership. Users can read and update their own profiles, create articles with themselves as authors, and perform CRUD operations on their own articles. Additionally, users can read all articles, but they cannot create, update, or delete articles authored by others.

These examples demonstrate the flexibility and power of the `@casl/ability` library. You can define complex rules based on user roles, object ownership, or any other attributes or conditions that are relevant to your application's authorization requirements.