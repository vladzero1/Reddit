import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constant";
import { SendEmail } from "../utils/sendEmail";

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
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('username') username: string,
    @Ctx() { em }: MyContext
  ) {
    const user = await em.findOne(User, { username: username });
    if (!user) {
      return false;
    }
    SendEmail(user.email, "hello world");
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

    if (options.username.length <= 2) {
      return {
        errors: [{
          field: "username",
          message: "length must be greater than 2!"
        }]
      }
    }

    if (!email.includes('@')) {
      return {
        errors: [{
          field: "email",
          message: "email must have '@'"
        }]
      }
    }

    if (options.password.length <= 3) {
      return {
        errors: [{
          field: "password",
          message: "length must be greater than 3!"
        }]
      }
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
      else if (new RegExp('Key \\(username\\).+').test(err.detail)){
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

