import Race from "@/server/types/Race";
import JsonObject from "../utils/JsonObject";

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
    }

}

export default ApiResponse;