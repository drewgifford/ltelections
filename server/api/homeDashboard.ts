import ApiResponse from "../types/ApiResponse";
import Race, { OfficeType } from "../types/Race";
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

  const PRESIDENTIAL_RACE = data.races.find(x => x.stateID == '0' && x.officeID == OfficeType.President);

  let PRES_RACES = data.races.filter(x => x.stateID != '0' && x.officeID == OfficeType.President);
  PRES_RACES.forEach(race => {
    PRESIDENTIAL_RACE?.reportingUnits.push(race.reportingUnits[0]);
  });

  // SENATE RACES
  const SENATE_RACES = data.races.filter(x => x.officeID == OfficeType.Senate).map(race => {
    race.reportingUnits = [race.reportingUnits[0]];
    return race;
  });

  const HOUSE_RACES = data.races.filter(x => x.officeID == OfficeType.House && !x.raceType?.includes('Special')).map(race => {
    race.reportingUnits = [race.reportingUnits[0]];
    return race;
  });
  


  return {

    races: {
      presidential: PRESIDENTIAL_RACE,
      senate: filterDuplicateRaces(SENATE_RACES),
      house: filterDuplicateRaces(HOUSE_RACES)
    }

  } as HomeDashboard;


  
})
