import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  gql,
  stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  Post,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { isServer } from "./isServer";

export const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error) {
        if (error.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      }
    })
  );
};

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isInCache = cache.resolve(entityKey, fieldKey) as string;

    info.partial = !isInCache;
    let results: string[] = [];
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore") as boolean;
      if (!_hasMore) hasMore = _hasMore;

      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore: hasMore,
      posts: results,
    };
  };
};

export const invalidateAllPost = (cache: Cache): void => {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter(
    (info: { fieldName: string }) => info.fieldName === "posts"
  );
  fieldInfos.forEach((fi: { arguments: any }) => {
    cache.invalidate("Query", "posts", fi.arguments || undefined);
  });
};

export const createUrqlClient = (ssrexchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: "http://localhost:4000/graphql",

    fetchOptions: {
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_results, args, cache, _info) => {
              const { id } = args as DeletePostMutationVariables;
              cache.invalidate({ __typename: "Post", id: id });
            },
            vote: (_results, args, cache, _info) => {
              const { postId, value } = args as VoteMutationVariables;
              const fragment = gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `;
              const data: Post = cache.readFragment(fragment, { id: postId });
              if (data) {
                if (data.voteStatus === value) {
                  console.log(data.voteStatus);
                  const newPoints = data.points - value;
                  cache.writeFragment(fragment, {
                    id: postId,
                    points: newPoints,
                    voteStatus: null,
                  });
                  return;
                } else {
                  const newPoints =
                    data.points + (!data.voteStatus ? 1 : 2) * value;
                  cache.writeFragment(fragment, {
                    id: postId,
                    points: newPoints,
                    voteStatus: value,
                  });
                }
              }
            },
            createPost: (_results, _args, cache, _info) => {
              invalidateAllPost(cache);
            },
            login: (results, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                results,
                { query: MeDocument },
                cache,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateAllPost(cache);
            },
            register: (results, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                results,
                { query: MeDocument },
                cache,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
            logout: (results, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                results,
                { query: MeDocument },
                cache,
                () => ({ me: null })
              );
            },
          },
        },
      }),
      errorExchange,
      ssrexchange,
      fetchExchange,
    ],
  };
};
