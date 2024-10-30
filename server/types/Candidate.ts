import Party from "@/server/types/Party"
import JsonObject from "../utils/JsonObject";
import Race from "@/server/types/Race";

export function attachCandidateData([...races]: Race[], candidateData: any[]){

    for(let race of races){

        for(let candidate of race.candidates){

            // Assign candidate image URL and description
            let match = candidateData.find((c: any) => c.id == candidate.polID);

            if(match){
                candidate.imageURL = match.image || '/img/generic-candidate.png';
                candidate.description = match.description || null;
            }
        }
        
    }

    return races;

    
}

export class Candidate extends JsonObject {

    first?: string
    last?: string
    fullName?: string
    party?: string
    partyData: Party | null = null
    candidateID?: string
    polID?: string
    polNum?: string
    parsed: boolean = false
    incumbent?: boolean
    probability: number = 0

    imageURL: string = '/img/generic-candidate.png'
    description: string | null = null;

    winner?: string;

    constructor(props?: Partial<Candidate>){
        super();
        Object.assign(this, props);

        this.partyData = new Party(this.partyData || this.party || "");

        if(!this.first) this.fullName = this.last;
        else if(!this.last) this.fullName = this.first;
        else this.fullName = `${this.first} ${this.last}`;

        if(this.party == 'No'){
            this.imageURL = '/img/issue-no.png';
        }
        if(this.party == 'Yes'){
            this.imageURL = '/img/issue-yes.png';
        }
    }

}

export default Candidate;