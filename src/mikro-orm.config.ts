import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import { User } from "./entities/User";

export default {
  allowGlobalContext:true,
  migrations: {
    path:  `${__dirname}/migrations`,
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post,User],
  dbName: "litereddit",
  type: "postgresql",
  password:"postgres",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];