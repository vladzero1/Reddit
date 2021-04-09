import { Updoot } from "../entities/Updoot";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  content: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  contentSnippets(@Root() root: Post) {
    return root.content.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    let realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;
    const updootData = await Updoot.findOne({
      where: { userId: userId, postId: postId },
    });
    const postData = await Post.findOne({ where: { id: postId } });
    console.log(updootData)
    if (updootData) {
      if (updootData.value !== realValue) {
        await getConnection().transaction(async () => {
          await Updoot.update({ userId, postId }, { value: realValue });
          await Post.update(
            {
              id: postId,
            },
            { points: postData?.points! + 2 * realValue }
          );
        });
      } else if (updootData.value === realValue) {
        await getConnection().transaction(async () => {
          await Updoot.remove(updootData);
          await Post.update(
            {
              id: postId,
            },
            { points: postData?.points! - realValue }
          );
        });
      }
    } else if (!updootData) {

      await getConnection().transaction(async () => {
        await Updoot.insert({
          userId,
          postId,
          value: realValue,
        });
        await Post.update(
          {
            id: postId,
          },
          { points: postData?.points! + realValue }
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() {req}: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacement: any[] = [realLimitPlusOne];
    if(req.session.userId){
      replacement.push(req.session.userId)
    }
    let cursorIdx= 3;
    if (cursor) {
      replacement.push(new Date(parseInt(cursor)));
      cursorIdx = replacement.length + 1;
    }
    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt"
      ) creator,
      ${
        req.session.userId
          ? `(select value from updoot where "userId" = $2 and "postId" =  p.id) "voteStatus"`
          : `null as voteStatus`
      } 
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacement
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    const data = await Post.findOne(id);
    const creator = await User.findOne(data?.creatorId);
    data!.creator = creator!;
    return data;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("input") input: PostInput
  ): Promise<Post | undefined> {
    const post = await Post.findOne(id);
    if (!post) {
      return undefined;
    }
    if (typeof input.title !== "undefined") {
      Post.update({ id }, { title: input.title, content: input.content });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Int) id: number): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }
}
