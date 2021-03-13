import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constant";
import { SendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { validatePasswordLength, validateUsernameLength } from "../utils/validation";

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
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { em, redis, req }: MyContext
  ): Promise<UserResponse> {
    let errors = validatePasswordLength(newPassword, "newPassword")
    if (errors) {
      return { errors };
    }
    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [{
          field: 'token',
          message: 'token expired'
        }]
      }
    }
    const user = await em.findOne(User, { id: parseInt(userId) });
    if (!user) {
      return {
        errors: [{
          field: 'token',
          message: 'user not exist'
        }]
      }
    }
    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);
    redis.del(key);
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('username') username: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { username: username });
    if (!user) {
      return true;
    }
    const token = v4();
    redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 30 * 3
    ); //3 days and it will expire

    SendEmail(
      user.email,
      `<a href="http:localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext
  ): Promise<User | null> {
    if (!req.session.userId) {
      return null
    }

    const user = await em.findOne(User, { id: req.session.userId })
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Arg('email') email: String,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {

    let errors = validateUsernameLength(options.password);
    if (errors) {
      return { errors };
    }

    if (!email.includes('@')) {
      return {
        errors: [{
          field: "email",
          message: "email must have '@'"
        }]
      }
    }

    errors = validatePasswordLength(options.password, "password")
    if (errors) {
      return { errors };
    }

    const hash = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hash,
      email: email
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {

      if (new RegExp('Key \\(email\\).+').test(err.detail)) {
        return {
          errors: [{
            field: "email",
            message: "email is already exist!"
          }]
        }
      }
      else if (new RegExp('Key \\(username\\).+').test(err.detail)) {
        return {
          errors: [{
            field: "username",
            message: "username is taken!"
          }]
        }
      }

    }
    //auto-login
    req.session.userId = user.id;
    return { user: user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, options.username.includes('@') ? { email: options.username } : { username: options.username })
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'username or email is not exist!'
        }]
      }
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{
          field: "password",
          message: "Wrong password!"
        }]
      }
    }

    req.session!.userId = user.id;
    return {
      user: user
    }


  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise(resolve => req.session.destroy(err => {
      if (err) {
        resolve(false);
        return
      }
      res.clearCookie(COOKIE_NAME)
      resolve(true)
    }))
  }
}

