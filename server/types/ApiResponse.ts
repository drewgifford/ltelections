import Race from "@/server/types/Race";

export class ApiResponse {

    apiVersion?: string
    apiBuild?: string
    timestamp?: string
    electionDate?: string
    nextrequest?: string
    races: Race[] = []

    constructor(props: Partial<ApiResponse>){
        Object.assign(this, props);

        this.races = (this.races).map(r => new Race(r));
    }

}

export default ApiResponse;