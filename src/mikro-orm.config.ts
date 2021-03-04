import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constant";
import { Post } from "./entities/Post";
import path from 'path'

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    host: "127.0.0.1",
    port: 5432,
    entities: [Post],
    dbName: 'reddit-clone',
    type: 'postgresql',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]