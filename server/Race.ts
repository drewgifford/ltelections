import Candidate from "./Candidate";

type ReportingUnit = {
    statePostal: string,
    stateName: string,
    level: string,
    electTotal: number,
    eevp: number,

    totalVotes: number,

    candidates: Candidate[]
}

type Race = {

    eventID: string,
    raceID: string,
    raceTypeID: string,
    hasForecast: boolean,
    stateID: string,

    

    officeID: string,
    tabulationStatus: string,
    raceCallStatus: string,

    officeName: string,
    seatName: string,
    seatNum: string,

    reportingUnits: ReportingUnit[]

    // Mini display help
    isPinned: boolean,


}

export function getUniqueRaceId(race: Race){
    return `${race.eventID}-${race.stateID}-${race.raceID}`;
}

export function getRaceById(races: Race[], id: string){
    return races.find(x => getUniqueRaceId(x) === id) || null;
}

export function raceIsEqual(race1: Race, race2: Race){
    return getUniqueRaceId(race1) === getUniqueRaceId(race2);
}

export default Race;