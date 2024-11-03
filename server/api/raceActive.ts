import {ApiRace} from "~/server/types/ApiTypes";
import {RedisUtil} from "~/server/plugins/RedisConnection";
import {RedisClientType} from "redis";

export default defineEventHandler(async (event) => {
  const redis: RedisClientType = RedisUtil.getConnection();

  if(!redis) return false;

  return await redis.json.get('racesActive') as { racesActive: boolean };

})
