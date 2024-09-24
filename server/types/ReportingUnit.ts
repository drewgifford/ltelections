import Candidate from "@/server/types/Candidate"
import { RaceParameters } from "./Race";

enum ReportingUnitLevel {
    SubUnit = "subunit",
    State = "state",
}

interface ReportingUnitParameters extends RaceParameters {
    precinctsReportingActual?: number,
    precinctsReportingProportional?: number
}

export class ReportingCandidate extends Candidate {
    voteCount: number = 0
    ballotOrder: number = -1

    constructor(props?: Partial<ReportingCandidate>){
        super(props);
    }   
}

export default class ReportingUnit {

    statePostal?: string
    stateName?: string
    reportingunitID?: string
    reportingunitlevel: number = -1
    pollClosingTime?: string
    level?: ReportingUnitLevel
    lastUpdated?: string
    precinctsReporting: number = 0
    eevp: number = 0
    precinctsTotal: number = 0
    precinctsReportingPct: number = 0
    candidates: ReportingCandidate[] = [];

    parameters: ReportingUnitParameters = {}

    constructor(props: Partial<ReportingUnit>){
        Object.assign(this, props);

        this.candidates = this.candidates.map(x => new ReportingCandidate(x));
    }

}

