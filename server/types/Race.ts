import Candidate from "@/server/types/Candidate";

enum OfficeType {
    President = "P"
}


export class Race {

    eventID: string | undefined;
    stateID: string | undefined;
    test: boolean = false;
    resultsType: string | undefined;
    raceID: number | undefined;
    raceType: string | undefined;
    raceTypeID: string | undefined;
    tabulationStatus: string | undefined;
    raceCallStatus: string | undefined;
    officeID: OfficeType | undefined;
    officeName: string | undefined;
    incumbents: any[] = [];
    reportingUnits: any[] = [];

    constructor(props?: Partial<Race>){
        Object.assign(this, props);

        this.incumbents = (this.incumbents).map(x => new Candidate(x));
    }

}

export default Race;