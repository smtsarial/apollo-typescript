import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { RedisStore } from "connect-redis";
import { Request, Response } from "express";
import session, { Session, SessionData } from "express-session";
import redis from 'redis';

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Session & Partial<SessionData> & { userId?: number } }
  res: Response
};
