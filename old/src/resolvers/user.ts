import { MyContext } from "src/types";
import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  InputType,
  Field,
  ObjectType,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { parse } from "path";
import { json } from "express";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Username lenght must be greather than 2",
          },
        ],
      };
    }
    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "Username lenght must be greather than 2",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (e) {
      //console.log("message: ", e);
      if (e.code == "23505") {
        return {
          errors: [{ field: "Duplicated", message: e.detail }],
        };
      }
    }
    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    //req.session!.userid = user.id;
    return { user };
  }

  

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    //console.log(req);
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{ field: "username", message: req.body }],
      };
    }
    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [{ field: "username", message: req.body  }],
      };
    }
    //req.session.userId = user?.id;

    return { user };
  }
}

