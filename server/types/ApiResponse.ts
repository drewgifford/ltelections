import Race from "@/server/types/Race";

export class ApiResponse {

    apiVersion: string | undefined
    apiBuild: string | undefined
    timestamp: string | undefined
    electionDate: string | undefined
    nextrequest: string | undefined
    races: Race[] = []

    constructor(props: Partial<ApiResponse>){
        Object.assign(this, props);

        this.races = (this.races).map(r => new Race(r));
    }

}

export default ApiResponse;