import { getCandidateData } from "../plugins/apiRefresh"

export class Candidate {

    first: string | undefined
    last: string | undefined
    party: string | undefined
    candidateID: string | undefined
    polID: string | undefined
    polNum: string | undefined

    imageURL: string | null = null;
    description: string | null = null;

    constructor(props?: Partial<Candidate>){
        Object.assign(this, props);

        let candidateData = getCandidateData();

        // Assign candidate image URL and description
        let match = candidateData.find(c => c.name.toLowerCase() == (this.first + ' ' + this.last).toLowerCase());

        if(match){
            this.imageURL = match.image;
            this.description = match.description || null;
        }

    }

}

export default Candidate;