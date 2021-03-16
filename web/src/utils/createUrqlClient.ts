import { cacheExchange } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { dedupExchange, Exchange, fetchExchange } from "urql";
import { pipe, tap } from "wonka";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

export const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error) {
        if(error.message.includes("not authenticated")){
          Router.replace("/login");
        }
      }
    })
  );
};

export const createUrqlClient = (ssrexchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
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
                  me: result.login.user
                }
              }
            }
          )
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
                  me: result.register.user
                }
              }
            }
          )
        },
        logout: (results, _args, cache, _info) => {
          betterUpdateQuery<LogoutMutation, MeQuery>(
            results,
            { query: MeDocument },
            cache,
            () => ({ me: null })
          );
        }
      },
    },
  }),
    errorExchange,
    ssrexchange,
    fetchExchange],
})