import {ApiCandidate, ApiRace, ApiState} from "~/server/types/ApiTypes";
import {RedisClientType} from "redis";

export type RaceQueried = Race & {
    pinned: boolean,
    inQuery: boolean,
}

export type Party = {
    partyID: string,
    name: string,
    shorthand: string,
    colors: string[]
}

export type Candidate = {
    first: string,
    last: string,
    fullName: string,
    party: Party,
    caucusWith?: string,
    polID: string, // key
}

export type State = {
    stateID: string,
    postalCode: string,
    name: string,
    fipsCode: string,
}

export type Race = {
    uuid: string,
    eventID: string,
    state: ApiState,
    tabulationStatus: string,
    raceCallStatus: string,
    raceType: string,
    officeID: string,
    officeName: string,
    totalVotes: number,
    expectedVotes: number,
    eevp: number,

    seatNum: number,
    seatName: string,
    flippedSeat: boolean,
    winThreshold: number,
    hasProjectomatic: boolean,
    pollingAverage: PollingAverage,
    candidates: Candidate[],
    incumbents: Candidate[],
    winners: Candidate[],
    results: {[polID: string]: {
            vote: number,
            probability: number,
        }}

    reportingUnits: {[reportingunitID: string]: RaceReportingUnit }
}

async function transformRace(redis: RedisClientType, apiRace: ApiRace) {
    let race = Object.assign({}, apiRace);

    // Replace candidates, incumbents, winners with Candidates from Redis
    let polIDs = [...new Set([...apiRace.candidates, ...apiRace.winners, ...apiRace.incumbents])];

    const result: ApiCandidate[] = await redis.json.mGet(polIDs.map(x => 'candidates.'+x), '.') as ApiCandidate[];

    for(let cand of result){

    }
}

export type RaceReportingUnit = ReportingUnit & {
    results: {[polID: string]: number}
    electTotal: number,
    eevp: number,
    totalVotes: number,
    expectedVotes: number,
    lastUpdated: string,
    precinctsTotal: number,
    precinctsReporting: number,
}

export type ReportingUnit = {

    state: ApiState,
    fipsCode: string,
    reportingunitName: string,
    reportingunitID: string,
    reportingunitLevel: number,
    pollClosingTime: string,

}