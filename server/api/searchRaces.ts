import {RedisClientType} from "redis";
import { redisClient } from "../utils/Redis";
import OfficeType from "../types/enum/OfficeType";

let STALE_TIME = 30
let ELECTION_DATE = "2024-11-05"

export default defineEventHandler(async (event) => {

  type BodyRes = {
    statePostal: string,
    officeID: OfficeType,
    raceUUIDs: string[],
    date: string,
    limit: number,
  }

  const redis: RedisClientType = redisClient();

  const query: BodyRes = getQuery(event);

  let queries = [`@type:{races}`];
  if(query.statePostal)

  redis.ft.search('races', `'@postalCode:{${query.statePostal}}' '@officeID:${query.officeID}'`);

  
})
