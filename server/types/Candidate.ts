import Party from "@/server/types/Party"
import JsonObject from "../utils/JsonObject";
import { getCandidateData } from "../utils/CandidateData";
//import { getCandidateData } from "../plugins/apiRefresh"

export class Candidate extends JsonObject {

    first?: string
    last?: string
    party?: string
    partyData: Party | null = null
    candidateID?: string
    polID?: string
    polNum?: string
    parsed: boolean = false

    imageURL: string | null = null
    description: string | null = null

    constructor(props?: Partial<Candidate>){
        super();
        Object.assign(this, props);

        this.partyData = new Party(this.partyData || this.party || "");

        if(!this.parsed){

            let candidateData = getCandidateData()

            // Assign candidate image URL and description
            let match = candidateData.find((c: any) => c.name.toLowerCase() == (this.first + ' ' + this.last).toLowerCase());
    
            if(match){
                this.imageURL = match.image;
                this.description = match.description || null;
            }
            this.parsed = true;
            
        }

        

        
        

    }

    fullName() { return `${this.first} ${this.last}` }

}

export default Candidate;