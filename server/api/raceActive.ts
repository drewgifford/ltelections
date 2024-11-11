import {ApiRace} from "~/server/types/ApiTypes";
import {RedisUtil} from "~/server/plugins/RedisConnection";
import {RedisClientType} from "redis";
import {H3Event} from "h3";

export default cachedEventHandler(async (event) => {
  const redis: RedisClientType = RedisUtil.getConnection();

  if(!redis) return false;

  return await redis.json.get('racesActive') as { racesActive: boolean };

}, {
  maxAge: 30,
  getKey: (event: H3Event) => event.path,
})
