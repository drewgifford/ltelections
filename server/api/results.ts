import {RedisClientType} from "redis";
import OfficeType from "../types/enum/OfficeType";
import {redisReplace, redisToArray} from "~/server/utils/Util";
import {CallData, Race, State, transformRaces} from "~/server/types/ViewModel";
import {RedisUtil} from "~/server/plugins/RedisConnection";
import {ApiCandidate, ApiParty, ApiRace} from "~/server/types/ApiTypes";
import {parseRaces} from "~/server/api/searchRaces";
import {pack} from "msgpackr";
import {H3Event} from "h3";

let STALE_TIME = 30
let ELECTION_DATE = "2024-11-05"

export default cachedEventHandler(async (event) => {

  type BodyRes = {
    raceUuid: string,
  }


  const redis: RedisClientType = RedisUtil.getConnection();

  if(!redis) return [];
  const query: BodyRes = getQuery(event);

  let results = await redis.json.get(`results.${query.raceUuid}`) as ApiRace;

  return results;
}, {
  maxAge: 30,
  getKey: (event: H3Event) => event.path,
});