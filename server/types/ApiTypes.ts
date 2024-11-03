import {PollingAverage} from "~/server/types/ViewModel";

export type ApiParty = {
    partyID: string,
    name: string,
    shorthand: string,
    colors: string[]
}

export type ApiCandidate = {
    first: string,
    last: string,
    fullName: string,
    party: string,
    caucusWith?: string,
    polID: string, // key
}

export type ApiCallData = {
    winner: string | null,
    calls: {[key: string]: string},
    status: string,
}


export type ApiState = {
    stateID: string,
    postalCode: string,
    name: string,
    fipsCode: string,
}

export type ApiRace = {
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
    call: ApiCallData,
    lastWinningParty: string,
    keyRace: boolean,

    seatNum: number,
    designation: string,
    seatName: string,
    flippedSeat: boolean,
    winThreshold: number,
    hasProjectomatic: boolean,
    pollingAverage: PollingAverage,
    candidates: string[],
    incumbents: string[],
    winners: string[],
    results: {[polID: string]: {
            vote: number,
            probability: number,
        }}

    reportingUnits: {[reportingunitID: string]: ApiRaceReportingUnit }
}

export type ApiRaceReportingUnit = {
    results: {[polID: string]: {
        vote: number
    }}
    electTotal: number,
    eevp: number,
    totalVotes: number,
    expectedVotes: number,
    lastUpdated: string,
    precinctsTotal: number,
    precinctsReporting: number,
}

export type ApiReportingUnit = {

    state: ApiState,
    fipsCode: string,
    reportingunitName: string,
    reportingunitID: string,
    reportingunitLevel: number,
    pollClosingTime: string,

}