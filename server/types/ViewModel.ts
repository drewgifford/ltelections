import {ApiCandidate, ApiRace, ApiReportingUnit, ApiState} from "~/server/types/ApiTypes";
import {RedisClientType} from "redis";
import { keyBy, keys } from "../utils/Util";

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
    imageURL: string,
    description: string,
}
export async function transformCandidate(redis: RedisClientType, apiCandidate: ApiCandidate){
    return (await transformCandidates(redis, [apiCandidate]))[0];
}
export async function transformCandidates(redis: RedisClientType, apiCandidates: ApiCandidate[]){

    let partyIds = [...new Set(apiCandidates.reduce((acc, apiCandidate) => {

        acc = [...acc, apiCandidate.party];
        return acc;

    }, [] as string[]))];

    const parties = keyBy(
        await redis.json.mGet(partyIds, '.') as Party[], 'partyID'
    );

    return apiCandidates.map((apiCandidate) => {
        let candidate = Object.assign({}, apiCandidate) as unknown as Candidate;
        candidate.party = parties[apiCandidate.party];

        return candidate;
    });
    
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
export async function transformRace(redis: RedisClientType, apiRace: ApiRace){
    return (await transformRaces(redis, [apiRace]))[0];
}
export async function transformRaces(redis: RedisClientType, apiRaces: ApiRace[]) {

    // Replace candidates, incumbents, winners with Candidates from Redis
    let polIDs = [...new Set(apiRaces.reduce((acc, race) => {
        acc = [...acc, ...race.candidates, ...race.incumbents, ...race.winners];
        return acc;
    }, [] as string[]))];

    let reportingUnitIDs = [...new Set(apiRaces.reduce((acc, race) => {
        acc = [...acc, ...keys(race.reportingUnits)];
        return acc;
    }, [] as string[]))];

    let apiCandidates = await redis.json.mGet(polIDs.map(x => 'candidates.'+x), '.') as ApiCandidate[];
    let reportingUnits = keyBy(await redis.json.mGet(reportingUnitIDs.map(x => 'reportingUnits.'+x), '.') as ApiReportingUnit[], 'reportingunitID');

    const candidates = keyBy(
        await transformCandidates(redis, apiCandidates), 'uuid'
    )

    return apiRaces.map(apiRace => {
        let race = Object.assign({}, apiRace) as unknown as Race;

        race.incumbents = apiRace.incumbents.map(x => candidates[x]);
        race.winners = apiRace.winners.map(x => candidates[x]);
        race.candidates = apiRace.candidates.map(x => candidates[x]);

        race.reportingUnits = keys(apiRace.reportingUnits).reduce((acc, reportingunitID) => {
            let ru = Object.assign({}, reportingUnits[reportingunitID]) as unknown as RaceReportingUnit;
            ru = Object.assign(ru, apiRace.reportingUnits[reportingunitID]);

            acc[reportingunitID] = ru;
            return acc;
        }, {} as {[key: string]: RaceReportingUnit});

        return race;
    });
    
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