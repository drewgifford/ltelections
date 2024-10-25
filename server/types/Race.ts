import Candidate from "@/server/types/Candidate";
import ReportingUnit, { ReportingCandidate, ReportingUnitLevel } from "./ReportingUnit";
import State from "@/server/types/State";
import JsonObject from "../utils/JsonObject";
import { CanPin } from "../utils/Raw";
import { PollingAverage } from "../utils/PollingAverage";

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

export type RacePinnable = Race & CanPin;

export default class Race extends JsonObject {

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
    candidates: ReportingCandidate[] = [];
    reportingUnits: ReportingUnit[] = [];
    raceNum?: string;
    inQuery?: boolean;
    lastWinningParty?: string;

    eevp: number = 0
    national: boolean = false
    statewide: boolean = false
    keyRace: boolean = false
    flippedSeat: boolean = false

    title: string
    description: string
    
    state?: State

    seatName?: string
    seatNum?: string
    winner?: string

    parameters: RaceParameters = {}
    designation?: string;

    pollingAverage?: PollingAverage
    hasProjectomatic: boolean = false;


    constructor(props?: Partial<Race>){
        super();
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
        if(props?.candidates instanceof Array){
            props.candidates = props.candidates.map(x => new ReportingCandidate(x));
        } else {

            let cands: ReportingCandidate[] = [];

            for(let ru of this.reportingUnits){
                for(let cand of ru.candidates){

                    let c = cands.find(x => x.candidateID === cand.candidateID);

                    if(!c) {
                        cands.push(cand);
                    } else if (ru.reportingunitLevel == 1){
                        c.voteCount = (c.voteCount || 0) + (cand.voteCount || 0);
                        if(!c.winner) c.winner = cand.winner;
                    }
                }
            }

            this.candidates = cands.map(r => new ReportingCandidate(r).toJSON());
        
        }

        this.title = this.getTitle();
        this.description = this.getDescription();

        
    }

    private getTitle() : string {

        let invalid = "Invalid Race Name";

        switch(this.officeID){

            case OfficeType.President:
                return `${this.state?.postalCode} - President`

            case OfficeType.Senate:
                return `${this.state?.postalCode} - Senate ${this.seatName}`;

            case OfficeType.House:
                return `${this.state?.postalCode} - House ${this.seatName}`;

            case OfficeType.BallotMeasure:
                return `${this.state?.postalCode} - ${this.officeName} ${this.designation}`

            case OfficeType.Governor:
                return `${this.state?.postalCode} - Governor`

            default:
                return invalid;
        }

    }

    private getDescription() : string {

        let invalid = "Invalid Race Description";

        switch(this.officeID){

            case OfficeType.President:
                return this.officeName || invalid;

            case OfficeType.Senate:
                return this.officeName || invalid;

            case OfficeType.House:
                return this.officeName || invalid;

            case OfficeType.BallotMeasure:
                return `${this.description}`;

            case OfficeType.Governor:
                return this.officeName || invalid;

            default:
                return invalid;
        }
    }
}