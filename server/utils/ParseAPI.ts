import {keys, sortRaces} from "~/server/utils/Util";

export function parseAPIResponse(res: any){
    if(!res) return [];

    try {
        for (let cand of keys(res.candidates)) {
            let c = res.candidates[cand];
            let candParty = c.party;

            if(!keys(res.parties).includes(candParty)) c.party = res.parties['Oth'];
            else res.candidates[cand].party = res.parties[res.candidates[cand].party];
        }

        for (let race of res.races) {

            race.candidates = race.candidates.map((x: string) => res.candidates[x]);
            race.incumbents = race.incumbents.map((x: string) => res.candidates[x]);
        }
        return sortRaces(res.races);

    } catch(e){
        console.error(e);
        return [];
    }
}