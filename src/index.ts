import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import { MyContext } from "./types";

const redis = require("redis");
const session = require("express-session");

const RedisStore = require("connect-redis")(session);

const main = async () => {
  const orm = await MikroORM.init();
  await orm.getMigrator().up();

  //await orm.em.nativeInsert(Post, { title: "hello2" });
  //const posts = await orm.em.find(Post, {});
  //console.log(posts)
  const app = express();

  const redisClient = redis.createClient({
    port: 6379,
    host: '127.0.0.1',
  });
  redisClient.connect().catch(console.error);

  redisClient.on("error", (err: any) => {
    console.error(`❗️ Redis Error: ${err}`);
  });
  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: false,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "qowiueojwojfalksdjoqiwueo",
      resave: false,
      ttl: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res })  => ({ em: orm.em, req, res}),
  });

  await apolloServer.start().then(() => {
    apolloServer.applyMiddleware({ app });
  });

  app.listen(4005, () => {
    console.log("server started on localhost:4005");
  });
};

main().catch((err) => {
  console.log(err);
});
