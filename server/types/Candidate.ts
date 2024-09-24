import Party from "@/server/types/Party"
//import { getCandidateData } from "../plugins/apiRefresh"

export class Candidate {

    first?: string
    last?: string
    party: Party | null = null;
    candidateID?: string
    polID?: string
    polNum?: string

    imageURL: string | null = null;
    description: string | null = null;

    constructor(props?: Partial<Candidate>){
        Object.assign(this, props);

        let candidateData = [];

        // Assign candidate image URL and description
        let match = candidateData.find(c => c.name.toLowerCase() == (this.first + ' ' + this.last).toLowerCase());

        if(match){
            this.imageURL = match.image;
            this.description = match.description || null;
        }

        // Assign party data
        if(this.party && typeof this.party === "string"){
            this.party = new Party(this.party) || null;
        }

    }

    fullName() { return `${this.first} ${this.last}` }

}

export default Candidate;