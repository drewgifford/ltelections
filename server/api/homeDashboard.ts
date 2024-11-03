
import {Race, transformRace, transformRaces} from "../types/ViewModel";
import { filterDuplicateRaces } from "../utils/Util";
import {RedisClientType} from "redis";
import {RedisUtil} from "~/server/plugins/RedisConnection";
import {ApiRace} from "~/server/types/ApiTypes";

let STALE_TIME = 30
let ELECTION_DATE = "2024-11-05"

type HomeDashboard = {
  races: {
    presidential: Race,
    senate: Race[],
    house: Race[]
  }
}
type RaceOverview = {

}

export default defineEventHandler(async (event) => {

  const redis: RedisClientType = RedisUtil.getConnection();

  let presRace = await redis.json.get('races.2024-11-05-0-0') as ApiRace;

  let senateRaces = await redis.ft.search('races', `'@type:{races}, @officeID:{S}'`, {
    LIMIT: {from: 0, size: 100}
  });

  let houseRaces = await redis.ft.search('races', `'@type:{races}, @officeID:{H}'`, {
    LIMIT: {from: 0, size: 500}
  });

  return {
    races: {
      presidential: await transformRace(redis, presRace),
      senate: await transformRaces(redis, redisToArray(senateRaces.documents || [])),
      house: await transformRaces(redis, redisToArray(houseRaces.documents || [])),
    }
  } as HomeDashboard

  


  
})
