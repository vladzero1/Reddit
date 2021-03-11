import { Cache, QueryInput } from '@urql/exchange-graphcache';

export function betterUpdateQuery<Result, Query>(
  result: any,
  args: QueryInput,
  cache: Cache,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(args, (data) => fn(result, data as any) as any);
};

