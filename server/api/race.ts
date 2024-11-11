import {RedisClientType} from "redis";
import OfficeType from "../types/enum/OfficeType";
import {redisReplace, redisToArray} from "~/server/utils/Util";
import {RedisUtil} from "~/server/plugins/RedisConnection";
import {ApiCandidate, ApiParty, ApiRace} from "~/server/types/ApiTypes";
import {parseRaces} from "~/server/api/searchRaces";
import States from "~/server/utils/States";
import {H3Event} from "h3";

let STALE_TIME = 30
let ELECTION_DATE = "2024-11-05"

export default cachedEventHandler(async (event) => {

  type BodyRes = {
    stateName?: string,
    raceParam?: string,
    officeID?: string,
    raceUuid?: string,
  }


  const redis: RedisClientType = RedisUtil.getConnection();

  if(!redis) return null;
  const query: BodyRes = getQuery(event);

  if(query.raceUuid){
    let race = await redis.json.get(`races.${query.raceUuid}`) as ApiRace;
    return await parseRaces(redis, [race]);
  }

  let state = States.find(x => x.name.toLowerCase() == query.stateName?.toLowerCase());
  if(!state) {
    console.log("Could not find state", query.stateName);
    return null;
  };
  let statePostal = state.postalCode;

  if(!query.officeID || !(<any>Object).values(OfficeType).includes(query.officeID || '')) {
    console.log("Could not find officeID", query.officeID);
    return null;
  }

  let queries = [`@type:{races}`];

  if(statePostal && statePostal != '*') queries.push(`@postalCode:{${redisReplace(statePostal)}}`);
  if(query.officeID != OfficeType.Any) queries.push(`@officeID:{${redisReplace(query.officeID)}}`);

  let results = await redis.ft.search('races', `'${queries.join(', ')}`, {
    LIMIT: {from: 0, size: 100}
  });

  let documents = redisToArray(results.documents) as ApiRace[];

  // Filter if this matches the query

  let race = documents.find(race => {

    // If the race param specifies this is a special election and this is not a special election, return false
    if(query.raceParam?.toLowerCase().includes("special")){
      if(!race.raceType.toLowerCase().includes("special")) return false;
    }
    else {
      if(race.raceType.toLowerCase().includes("special")) return false;
    }


    // If this is a house race, make sure the seat number is correct
    if(query.officeID == OfficeType.House){
      // Check if the seat number matches
      let seatNum = query.raceParam?.split("-").find(x => !isNaN(Number(x)));
      if(seatNum && Number(seatNum) != race.seatNum) return false;
    }

    if(query.officeID == OfficeType.BallotMeasure){

      let parts = query.raceParam?.split("-");
      if(parts){
        let designation = parts[parts.length-1].replace("_", " ");

        if(designation != race.designation) return false;
      }
    }



    return true;


  });

  if(!race) return null;
  let res = await parseRaces(redis, [race]);

  return res;
}, {
  maxAge: 30,
  getKey: (event: H3Event) => event.path,
});