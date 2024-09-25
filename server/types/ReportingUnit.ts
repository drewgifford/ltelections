import Candidate from "@/server/types/Candidate"
import { RaceParameters } from "./Race";
import JsonObject from "../utils/JsonObject";

export enum ReportingUnitLevel {
    SubUnit = "subunit",
    State = "state",
}

export interface ReportingUnitParameters extends RaceParameters {
    precinctsReportingActual?: number,
    precinctsReportingProportional?: number
}

export class ReportingCandidate extends Candidate {
    voteCount?: number
    ballotOrder?: number

    constructor(props?: Partial<ReportingCandidate>){
        super(props);
        Object.assign(this, props);
    }   
}

export default class ReportingUnit extends JsonObject {

    statePostal?: string
    stateName?: string
    reportingunitID?: string
    reportingunitLevel: number = -1
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
        super();

        Object.assign(this, props);

        this.candidates = this.candidates.map(x => new ReportingCandidate(x));
    }

}

