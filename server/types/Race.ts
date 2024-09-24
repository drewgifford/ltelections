import Candidate from "@/server/types/Candidate";
import ReportingUnit from "./ReportingUnit";
import State from "@server/types/State";

export enum OfficeType {
    
    Senate = "S",
    House = "H",
    Governor = "G",
    BallotMeasure = "I",
    President = "P"
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