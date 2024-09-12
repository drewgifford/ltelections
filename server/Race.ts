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

    raceId: string,
    raceTypeID: string,
    hasForecast: boolean,

    officeID: string,
    tabulationStatus: string,
    raceCallStatus: string,

    officeName: string,
    seatName: string,
    seatNum: string,

    reportingUnits: ReportingUnit[];

}

export default Race;