import {RedisClientType} from "redis";
import OfficeType from "../types/enum/OfficeType";
import {redisReplace, redisToArray} from "~/server/utils/Util";
import {CallData, Race, State, transformRaces} from "~/server/types/ViewModel";
import {RedisUtil} from "~/server/plugins/RedisConnection";
import {ApiCandidate, ApiParty, ApiRace} from "~/server/types/ApiTypes";
import {pack} from "msgpackr";

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

  return await parseRaces(redis, redisToArray(resultDocuments || []));
});

type RaceViewModel = {
  uuid: string,
  eevp: number,
  candidates: string[],
  results: {[key: string]: {
      vote: number, probability: number,
    }},
  state: State,
  totalVotes: number,
  officeID: string,
  officeName: string,
  seatNum: number,
  raceType: string,
  incumbents: string[],
  designation: number,
  hasProjectomatic: boolean,
  call: CallData
}

export async function parseRaces(redis: RedisClientType, races: ApiRace[]) {
  let totalCandidates: string[] = [];

  let array = races.filter(x => x.state.postalCode != 'US').map(
      race => {
        let high = keys(race.results).reduce((a,b) => { return race.results[a].probability > race.results[b].probability ? a : b });



        let results: any = {};
        let candidates = [high];
        results[high] = race.results[high];


        if(race.candidates.length > 1){
          let second = keys(race.results).filter(x => x != high).reduce((a,b) => { return race.results[a].probability > race.results[b].probability ? a : b });
          results[second] = race.results[second];
          candidates.push(second);
        }

        totalCandidates = [...totalCandidates, ...candidates, ...race.incumbents];
        return {
          uuid: race.uuid,
          eevp: race.eevp,
          candidates: candidates,
          results: results as any,
          state: race.state,
          totalVotes: race.totalVotes,
          officeID: race.officeID,
          officeName: race.officeName,
          seatNum: race.seatNum,
          call: race.call,
          raceType: race.raceType,
          incumbents: race.incumbents,
          designation: race.designation,
          hasProjectomatic: race.hasProjectomatic,
        } as unknown as RaceViewModel;
      }
  );


  // Get candidates
  totalCandidates = [...new Set(totalCandidates)];

  let cands: ApiCandidate[] = [];
  if(totalCandidates.length > 0){
    cands = await redis.json.mGet(totalCandidates.map(x => `candidates.${x}`), '.') as ApiCandidate[];
  }

  let partyStrs: string[] = [];

  let parties: ApiParty[] = [];
  // Loop through the candidates and get the parties included
  for(let cand of cands){
    if(!partyStrs.includes(cand.party)) partyStrs.push(cand.party);
  }
  console.log(partyStrs);
  if(partyStrs.length > 0){
    parties = await redis.json.mGet(partyStrs.map(x => `parties.${x}`), '.') as ApiParty[];
  }
  console.log(parties);


  return {
    candidates: keyBy(cands, 'polID'),
    races: array,
    parties: keyBy(parties, 'partyID'),
  };
}