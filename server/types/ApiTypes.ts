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
    results: {[polID: string]: number}
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