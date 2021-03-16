import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput{
  @Field()
  title: string

  @Field()
  content: string
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find()
  }

  @Query(() => [Post], { nullable: true })
  post(
    @Arg('id', () => Int) id: number,
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() {req}: MyContext
  ): Promise<Post> {
    return Post.create({ 
      ...input,
      creatorId: req.session.userId
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('input') input: PostInput,
  ): Promise<Post | undefined> {
    const post = await Post.findOne(id);
    if (!post) {
      return undefined;
    }
    if (typeof input.title !== 'undefined') {
      Post.update({id},{title: input.title, content: input.content});
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id', () => Int) id: number,
  ): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }
}