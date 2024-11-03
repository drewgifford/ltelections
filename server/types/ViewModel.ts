import {
    ApiCandidate,
    ApiParty,
    ApiRace,
    ApiRaceReportingUnit,
    ApiReportingUnit,
    ApiState
} from "~/server/types/ApiTypes";
import {RedisClientType} from "redis";
import {keyBy, keys, redisReplace, redisToArray} from "../utils/Util";
import OfficeType from "~/server/types/enum/OfficeType";

export type PollingAverage = {
    [polID: string]: {
        average: number,
        includedPolls: number
    }
}

export type CallData = {
    winner: Candidate | null,
    calls: {[key: string]: string},
    status: string,
}

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
    electWon: number,
}

export type PresidentialReportingUnit = RaceReportingUnit & Race;

export async function transformCandidate(redis: RedisClientType, apiCandidate: ApiCandidate){
    return (await transformCandidates(redis, [apiCandidate]))[0];
}
export async function transformCandidates(redis: RedisClientType, apiCandidates: ApiCandidate[]){


    let partyIds = [...new Set(apiCandidates.reduce((acc, apiCandidate) => {
        acc = [...acc, apiCandidate.party];
        return acc;

    }, [] as string[]))];


    const parties = keyBy(
        await Promise.all(partyIds.map(async (x) => await redis.json.get(`parties.${x}`)))
        , 'partyID'
    );


    return apiCandidates.map((apiCandidate) => {
        let candidate = Object.assign({}, apiCandidate) as unknown as Candidate;

        if(!hasKey(parties, apiCandidate.party)) apiCandidate.party = 'Ind';

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
    raceType: string,
    officeID: string,
    officeName: string,
    totalVotes: number,
    expectedVotes: number,
    eevp: number,
    call: CallData,
    lastWinningParty: string,
    keyRace: boolean,
    designation: string,
    summary: string,


    seatNum: number,
    seatName: string,
    flippedSeat: boolean,
    winThreshold: number,
    hasProjectomatic: boolean,
    pollingAverage: PollingAverage,
    candidates: Candidate[],
    incumbents: Candidate[],
    results: {[polID: string]: {
            vote: number,
            probability: number,
        }},

    title: {
        location: string,
        text: string,
    }

    reportingUnits: {[reportingunitID: string]: RaceReportingUnit }
}
export async function transformRace(redis: RedisClientType, apiRace: ApiRace, skipRus?: boolean){
    return (await transformRaces(redis, [apiRace], skipRus || false))[0];
}
export async function transformRaces(redis: RedisClientType, apiRaces: ApiRace[], skipRus?: boolean) {

    // Replace candidates, incumbents, winners with Candidates from Redis
    let polIDs = [...new Set(apiRaces.reduce((acc, race) => {
        acc = [...acc, ...race.candidates, ...race.incumbents];
        if(race.call.winner) acc.push(race.call.winner);
        return acc;
    }, [] as string[]))];

    let reportingUnits;



    let apiCandidates = (
        await Promise.all(polIDs.map(async (x) => await redis.json.get(`candidates.${x}`)))
    ) as ApiCandidate[];


    if(!skipRus) {
        let reportingUnitIDs = [...new Set(apiRaces.reduce((acc, race) => {
            acc = [...acc, ...keys(race.reportingUnits)];
            return acc;
        }, [] as string[]))];

        reportingUnits = keyBy(
            await Promise.all(reportingUnitIDs.map(async (x) => await redis.json.get(`reportingUnits.${x}`))),
            'reportingunitID'
        );
    } else {
        reportingUnits = apiRaces.reduce((acc, race) => {

            for(let key of keys(race.reportingUnits)){
                acc[key] = race.reportingUnits[key];
            }
            return acc;
        }, {} as {[key: string]: ApiRaceReportingUnit})
    }



    const candidates = keyBy(
        await transformCandidates(redis, apiCandidates), 'polID'
    )

    const getRaceTitle = (r: ApiRace) => {
        let districtText = '';
        let officeText = r.officeName;

        if(r.officeID == OfficeType.BallotMeasure){
            officeText = `${r.officeName} ${r.designation}`
        }
        else if(r.officeID == OfficeType.House || r.officeID == OfficeType.President){
            if(r.seatNum > 0){
                districtText = `-${r.seatNum}`;
            }
        }

        if(r.raceType.includes("Special")){
            officeText += ` Special`;
        }

        return {
            location: `${r.state.postalCode}${districtText}`,
            text: officeText
        }
    }



    return apiRaces.map(apiRace => {
        let race = Object.assign({}, apiRace) as unknown as Race;

        race.incumbents = apiRace.incumbents.map(x => candidates[x]);
        if(apiRace.call.winner) race.call.winner = candidates[apiRace.call.winner];
        race.candidates = apiRace.candidates.map(x => candidates[x]);

        race.title = getRaceTitle(apiRace);

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
    results: {[polID: string]: {
        vote: number
    }},
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

export type HasResults = {
    results: {[polID: string]: {
        vote: number, probability?: number,
    }},
    totalVotes: number,
    expectedVotes: number,
}