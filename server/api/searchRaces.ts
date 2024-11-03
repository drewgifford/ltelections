import {RedisClientType} from "redis";
import OfficeType from "../types/enum/OfficeType";
import {redisToArray} from "~/server/utils/Util";
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
  console.log(query);

  let queries = [`@type:{races}`];

  query.raceUUIDs = [];



  if(query.statePostal && query.statePostal != '*') queries.push(`@postalCode:{${query.statePostal}}`);
  if(query.officeID && query.officeID != OfficeType.Any) queries.push(`@officeID:{${query.officeID}}`);
  if(query.stateName) queries.push(`@stateName:(${query.stateName})`);

  console.log(queries);

  let results = await redis.ft.search('races', `'${queries.join(', ')}`, {
    LIMIT: {from: 0, size: 100}
  });

  let resultDocuments = results.documents;

  let array = redisToArray(resultDocuments || []);

  //console.log(array.find(x => x.state.postalCode == 'ME' && x.officeID == OfficeType.Senate).uuid);

  //console.log(query);

  return await transformRaces(redis, array);
  
})
