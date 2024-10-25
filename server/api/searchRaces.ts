import ApiResponse from "../types/ApiResponse";
import Race, { OfficeType } from "../types/Race";

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


  const query: BodyRes = getQuery(event);

  if(!query.limit) query.limit = 1000;

  if(query.date == '2024') query.date = '2024-11-05';

  const data = (await useStorage().getItem(query.date || "") || {}) as ApiResponse;

  let d = data.races?.filter(race => {

    if(query.raceUUIDs && query.raceUUIDs.includes(race.uuid)){
      
      return true;
    }

    // Check if it's in the state
    if(query.statePostal === race.state?.postalCode || query.statePostal == '*'){

      if(query.officeID == race.officeID || query.officeID == OfficeType.Any){
        return true;
      }

    }

  });

  if(d) return d.splice(0,query.limit);
  return [];
  
})
