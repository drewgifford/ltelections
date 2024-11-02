import ApiResponse from "../types/ApiResponse";
import { Race } from "../types/ViewModel";
import { filterDuplicateRaces } from "../utils/Util";

let STALE_TIME = 30
let ELECTION_DATE = "2024-11-05"

type HomeDashboard = {
  races: {
    presidential: Race,
    senate: Race[],
    house: Race[]
  }
}
type RaceOverview = {

}

export default defineEventHandler(async (event) => {

  type BodyRes = {
    date: string,
  }


  const query: BodyRes = getQuery(event);

  if(query.date == '2024') query.date = '2024-11-05';

  const data = (await useStorage().getItem(query.date || "") || {}) as ApiResponse;

  if(!data.races) data.races = [];

  


  
})
