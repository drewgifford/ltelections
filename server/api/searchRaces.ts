import { LTE_API_KEY } from "../config";
import Race, { getUniqueRaceId, raceIsEqual } from "../Race";

let STALE_TIME = 30

export default defineEventHandler(async (event) => {

  type BodyRes = {
    statePostal: string,
    officeID: string,
    raceUUIDs: string[]
  }

  type RedisQuery = {
    timestamp: number,
    data: object,
  }

  const query: BodyRes = getQuery(event);

  // Check if the query is in the Redis database and not stale

  let item = await useStorage("redis").getItem("2024-11-05") as RedisQuery | null;
  let lteData = await useStorage("redis").getItem("lteData") as any;

  if(item == null) return [] as Race[];

  // Check date
  let data: any = item as any;

  let races = data.races == null ? [] : (data.races as Race[]);
  
  let filtered = races;

  if(query.officeID != null){
    filtered = filtered.filter(race => {
      if (query.officeID == "*" || race.officeID == query.officeID) return true;
      return false;
    });
  }

  if(query.statePostal != null){
    filtered = filtered.filter(race =>
      query.statePostal == "*" || race.reportingUnits.length >= 1 && race.reportingUnits[0].statePostal == query.statePostal
    );
  }

  if(query.raceUUIDs != null && query.raceUUIDs.length > 0){
    filtered = filtered.filter(race => 
      query.raceUUIDs.includes(getUniqueRaceId(race))
    )
  }

  filtered.forEach(x => {
    x.reportingUnits.forEach(unit => {

      unit.candidates.forEach(cand => {

        for(var party of lteData.parties){
          if(party.partyId === cand.party){
            cand.partyData = party;
          }
        }
      });
    });
  });
  
  // State filter
 
  return [... new Set(filtered)];
  
})
