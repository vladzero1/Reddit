import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import theme from '../theme';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
  result: any,
  args: QueryInput,
  cache: Cache,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(args, (data) => fn(result, data as any) as any);
};

const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        login: (_result, _args, cache, _info) => {
          betterUpdateQuery<LoginMutation, MeQuery>(
            _result,
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
        register: (_result, _args, cache, _info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            _result,
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
        }
      },
    },
  }), fetchExchange],
});

function MyApp({ Component, pageProps }: any) {

  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>

  )
}

export default MyApp
