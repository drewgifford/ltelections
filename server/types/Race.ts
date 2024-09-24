import Candidate from "@/server/types/Candidate";
import ReportingUnit, { ReportingCandidate } from "./ReportingUnit";
import State from "@/server/types/State";

export enum OfficeType {
    
    Senate = "S",
    House = "H",
    Governor = "G",
    BallotMeasure = "I",
    President = "P",
    Any = "*"
}

export interface VoteParameters {
    expected: {
        actual: number,
        eevpCap: number
    },
    total: number,
    registered: number
}

export interface RaceParameters {
    vote?: VoteParameters
}

export default class Race {

    uuid: string

    eventID?: string;
    stateID?: string;
    test: boolean = false;
    resultsType?: string;
    raceID?: number;
    raceType?: string;
    raceTypeID?: string;
    tabulationStatus?: string;
    raceCallStatus?: string;
    officeID?: OfficeType;
    officeName?: string;
    incumbents: Candidate[] = [];
    candidates: Candidate[] = [];
    reportingUnits: ReportingUnit[] = [];

    eevp: number = 0
    national: boolean = false
    statewide: boolean = false
    keyRace: boolean = false
    flippedSeat: boolean = false
    
    state?: State

    seatName?: string

    parameters: RaceParameters = {}


    constructor(props?: Partial<Race>){
        Object.assign(this, props);

        this.incumbents = (this.incumbents).map(x => new Candidate(x));
        this.reportingUnits = (this.reportingUnits).map(x => new ReportingUnit(x));

        this.uuid = `${this.eventID}-${this.stateID}-${this.raceID}`;

        // Set state
        if(typeof this.state == "boolean") {
            this.statewide = this.state;
        }
        this.state = new State(this.stateID)

        // Get candidates from reporting units
        let cands: Candidate[] = [];
        for(let ru of this.reportingUnits){
            for(let cand of ru.candidates){

                let c = cands.find(x => x.candidateID === cand.candidateID);

                if(!c) cands.push(cand);

                else if(cand instanceof ReportingCandidate && c instanceof ReportingCandidate){

                    c.voteCount += cand.voteCount;

                }

                
            }
        }

        this.candidates = cands;
        
    }

    getTitle() : string | undefined {

        switch(this.officeID){

            case OfficeType.President:
                return this.officeName;

            case OfficeType.Senate:
                return this.officeName;

            case OfficeType.House:
                return this.officeName;

            case OfficeType.BallotMeasure:
                return this.seatName;

            case OfficeType.Governor:
                return this.officeName;

            default:
                return "Invalid Race Name";
        }

    }

    getDescription() : string | undefined {
        switch(this.officeID){

            case OfficeType.President:
                return this.officeName;

            case OfficeType.Senate:
                return this.officeName;

            case OfficeType.House:
                return this.officeName;

            case OfficeType.BallotMeasure:
                return this.seatName;

            case OfficeType.Governor:
                return this.officeName;

            default:
                return "Invalid Race Description";
        }
    }
}