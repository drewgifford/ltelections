import Party from "@/server/types/Party"
import JsonObject from "../utils/JsonObject";
import Race from "@/server/types/Race";

export function attachCandidateData([...races]: Race[], candidateData: any[]){

    for(let race of races){

        for(let candidate of race.candidates){

            // Assign candidate image URL and description
            let match = candidateData.find((c: any) => c.id == candidate.polID);

            if(match){
                candidate.imageURL = match.image;
                candidate.description = match.description || null;
            }
        }
        
    }

    return races;

    
}

export class Candidate extends JsonObject {

    first?: string
    last?: string
    party?: string
    partyData: Party | null = null
    candidateID?: string
    polID?: string
    polNum?: string
    parsed: boolean = false

    imageURL: string = 'https://media.discordapp.net/attachments/1212623884948340757/1288587531289497600/Generic.png?ex=66f5ba28&is=66f468a8&hm=a4c2336dd1826facc93c4770f84d3a6722369029344c4fc6aa9244e41040414a&=&format=webp&quality=lossless&width=1164&height=1456'
    description: string | null = null;

    winner?: string;

    constructor(props?: Partial<Candidate>){
        super();
        Object.assign(this, props);

        this.partyData = new Party(this.partyData || this.party || "");
    }

    fullName() { return `${this.first} ${this.last}` }

}

export default Candidate;