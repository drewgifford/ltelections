import {RedisClientType} from "redis";
import {RedisUtil} from "~/server/plugins/RedisConnection";
import {ApiCandidate, ApiParty, ApiRace, ApiState} from "~/server/types/ApiTypes";
import {parseRaces} from "~/server/api/searchRaces";
import {Candidate, Race} from "~/server/types/ViewModel";

let STALE_TIME = 30
let ELECTION_DATE = "2024-11-05"

export type ApiMinimalRace = {
  candidates: {
    last: string,
    party: string,
    probability: number,
    vote: number,
    polID: string,
  }[],
  state?: ApiState,
  uuid: string,
  eevp: number,
  special: boolean,
  totalVotes: number,
  winner: string | null,
  electTotal: number,
  seatNum?: number,
}

export type ApiHomeDashboard = {
  presRace: Race,
  presRaces: {[key: string]: ApiMinimalRace},
  senateRaces: {[key: string]: ApiMinimalRace},
  houseRaces: {[key: string]: ApiMinimalRace},
  parties: {[key: string]: ApiParty},
  values: any,
  senateModel: any,
}
type RaceOverview = {

}

export default defineEventHandler(async (event) => {

  const redis: RedisClientType = RedisUtil.getConnection();

  if(!redis) return {};

  let homeDashboard = await redis.json.get('homeDashboard') as ApiHomeDashboard;



  if(!homeDashboard) return {};

  // Fix vote totals because they do not update quickly
  for(let key of keys(homeDashboard.presRace.results)){
    homeDashboard.presRace.results[key].vote = 0
  }

  for(let rid of keys(homeDashboard.presRaces)){
    let race = homeDashboard.presRaces[rid];

    for(let cand of Object.values(race.candidates)){
      if(hasKey(homeDashboard.presRace.results, cand.polID)){
        homeDashboard.presRace.results[cand.polID].vote += cand.vote;
      }

    }

  }

  console.log(homeDashboard.presRace.results);

  homeDashboard.presRace.candidates = await redis.json.mGet((homeDashboard.presRace as unknown as ApiRace).candidates.map(x => `candidates.${x}`), '.') as Candidate[];

  return homeDashboard;

  
})
