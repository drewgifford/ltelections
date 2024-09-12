import { LTE_API_KEY } from "../config";
import Race from "../Race";

let STALE_TIME = 30

export default defineEventHandler(async (event) => {

  type BodyRes = {
    statePostal: string,
    officeID: string,
  }

  type RedisQuery = {
    timestamp: number,
    data: object,
  }

  const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];
  const query: BodyRes = getQuery(event);

  console.log(query);
  
  console.log(LTE_API_KEY());

  // Check if the query is in the Redis database and not stale

  let redisKey = `${query.statePostal}-2024-11-05`;

  let item = await useStorage("redis").getItem(redisKey) as RedisQuery | null;
  let now = Date.now();

  let difference = -1;
  if(item) difference = (Math.abs(now - item.timestamp));

  // Check date
  let data: any;
  //if (query.statePostal == "*") query.statePostal = "None";

  if (item == null || difference >= STALE_TIME * 1000){

    console.log("Requesting new data...");

    let reqQuery = `https://api.ltelections.com/?statepostal=${query.statePostal}&officeID=${allowedOfficeIDs.join(',')}&electiondate=2024-11-05&format=json&apiKey=${LTE_API_KEY()}`;

    let res = await fetch(reqQuery);

    let json = await res.json();

    await useStorage("redis").setItem(redisKey, {
      timestamp: now,
      data: json
    });

    data = json;


  } else {
    console.log("Using cached data.");
    data = item.data;
  }
  return data.races == null ? [] : (data.races as Race[]).filter(race => {

    console.log(race.officeID);

    if (query.officeID == "*" || race.officeID == query.officeID) return true;
    return false;

  }).map((race) => {

    for (var unit of race.reportingUnits) {

      unit.candidates = unit.candidates.sort((a,b) => {
        return a.voteCount < b.voteCount ? 1 : -1
      });

    }

    return race;


  });
  
})
