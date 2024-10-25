import Race, { OfficeType } from "@/server/types/Race";
import JsonObject from "../utils/JsonObject";

const OFFICE_HIERARCHY = [
    OfficeType.President,
    OfficeType.Senate,
    OfficeType.Governor,
    OfficeType.House,
    OfficeType.BallotMeasure
]

export class ApiResponse extends JsonObject {

    apiVersion?: string
    apiBuild?: string
    timestamp?: string
    electionDate?: string
    nextrequest?: string
    races: Race[] = []

    constructor(props: Partial<ApiResponse>){
        super();
        Object.assign(this, props);

        this.races = (this.races).map(r => new Race(r));

        this.races.sort((a,b) => {

            if((a.state?.name || '') > (b.state?.name || '')) return -1;
            else if((a.state?.name || '') < (b.state?.name || '')) return 1;

            if(OFFICE_HIERARCHY.indexOf(a.officeID as any) > OFFICE_HIERARCHY.indexOf(b.officeID as any)) return 1;
            else if(OFFICE_HIERARCHY.indexOf(a.officeID as any) < OFFICE_HIERARCHY.indexOf(b.officeID as any)) return -1;

            if(a.seatNum && b.seatNum){
                if(Number(a.seatNum) > Number(b.seatNum)) return 1;
                else if (Number(a.seatNum) < Number(b.seatNum)) return -1;
            }
            

            return 0;


        })
    }

}

export default ApiResponse;