import {RedisClientType} from "redis";
import OfficeType from "../types/enum/OfficeType";
import {redisReplace, redisToArray} from "~/server/utils/Util";
import {transformRaces} from "~/server/types/ViewModel";
import {RedisUtil} from "~/server/plugins/RedisConnection";

let STALE_TIME = 30
let ELECTION_DATE = "2024-11-05"

export default defineEventHandler(async (event) => {

  type BodyRes = {
    statePostal: string,
    stateName: string,
    officeID: OfficeType,
    raceUUIDs: string[],
    date: string,
    limit: number,
  }


  const redis: RedisClientType = RedisUtil.getConnection();

  if(!redis) return [];

  const query: BodyRes = getQuery(event);

  let queries = [`@type:{races}`];

  query.raceUUIDs = [];



  if(query.statePostal && query.statePostal != '*') queries.push(`@postalCode:{${redisReplace(query.statePostal)}}`);
  if(query.officeID && query.officeID != OfficeType.Any) queries.push(`@officeID:{${redisReplace(query.officeID)}}`);
  if(query.stateName) queries.push(`@stateName:(${redisReplace(query.stateName)})`);

  let results = await redis.ft.search('races', `'${queries.join(', ')}`, {
    LIMIT: {from: 0, size: 100}
  });

  let resultDocuments = results.documents;

  let array = redisToArray(resultDocuments || []).filter(x => x.state.postalCode != 'US');

  return await transformRaces(redis, array);
  
})
