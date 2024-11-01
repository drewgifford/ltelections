import ApiResponse from "../types/ApiResponse";
import Race, { OfficeType } from "../types/Race";
import {RedisClientType} from "redis";

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

  redis.ft.search('races', `@postalCode:{${event.query.statePostal}}`)

  
})
