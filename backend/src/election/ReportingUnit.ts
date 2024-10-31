import Candidate from "@/server/types/Candidate"
import { RaceParameters } from "./Race";
import JsonObject from "../utils/JsonObject";
import { FIPS_CODES } from "../utils/FipsCodes";

const NEW_ENGLAND_STATES = ["CT", "NH", "MA", "RI", "VT", "ME"];

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
    reportingunitName?: string
    pollClosingTime?: string
    level?: ReportingUnitLevel
    lastUpdated?: string
    precinctsReporting: number = 0
    eevp: number = 0
    precinctsTotal: number = 0
    precinctsReportingPct: number = 0
    candidates: ReportingCandidate[] = []
    fipsCode: string = "";
    townFIPSCode?: string
    electTotal?: number

    cookPVI?: number;
    swing?: number;

    parameters: ReportingUnitParameters = {}

    constructor(props: Partial<ReportingUnit>){
        super();

        Object.assign(this, props);

        if(this.stateName) this.reportingunitName = this.stateName;
        else if(NEW_ENGLAND_STATES.includes(this.statePostal || '')){
            try {
                this.reportingunitName = FIPS_CODES[this.statePostal || ''][this.townFIPSCode || '']
            } catch (e){
                this.reportingunitName = "Undefined";
            }
        }
        else {
            try {
                this.reportingunitName = FIPS_CODES[this.statePostal || ''][this.fipsCode || '']
            } catch (e){
                this.reportingunitName = "Undefined";
            }
        }

        let words = this.reportingunitName?.split(" ") || [];
        if(words.length > 1){
            const ILLEGAL_WORDS = ["County", "Town", "Parish", "town"];
            if(ILLEGAL_WORDS.includes(words[words.length-1])) this.reportingunitName = words.splice(0, words.length-1).join(" ");
        }

        this.candidates = this.candidates.map(x => new ReportingCandidate(x));
    }

}

