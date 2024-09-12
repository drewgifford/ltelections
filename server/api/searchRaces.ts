import { LTE_API_KEY } from "../config";
import Race, { getUniqueRaceId, raceIsEqual } from "../Race";

let STALE_TIME = 30

export default defineEventHandler(async (event) => {

  type BodyRes = {
    statePostal: string,
    officeID: string,
    include: string[]
  }

  type RedisQuery = {
    timestamp: number,
    data: object,
  }

  const query: BodyRes = getQuery(event);

  // Check if the query is in the Redis database and not stale

  let item = await useStorage("redis").getItem("2024-11-05") as RedisQuery | null;

  if(item == null) return [] as Race[];

  // Check date
  let data: any = item as any;
  console.log(query.include);
  
  return data.races == null ? [] : (data.races as Race[]).filter(race => {
    if (query.officeID == "*" || race.officeID == query.officeID) return true;

    else if((query.include || []).includes(getUniqueRaceId(race))) return true;
    
    return false;

  })
  // State filter
  .filter(race => query.statePostal == "*" || race.reportingUnits.length >= 1 && race.reportingUnits[0].statePostal == query.statePostal);
  
})
