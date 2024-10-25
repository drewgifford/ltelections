import axios from "axios";
import Race, { OfficeType } from "../types/Race";

const DECISION_DESK_URL = "https://api.ltelections.com/races/";

type DecisionDeskRace = {
    state: string,
    id: string,
    date: string,
    raceOffice: string,
    raceType: OfficeType,
    incumbent: string,
    calledAt: string,
}


export async function attachDecisionDeskData(races: Race[]){

    const response = await axios.get(DECISION_DESK_URL, { responseType: "blob" });

    const ddRaces: DecisionDeskRace[] = await JSON.parse(await response.data);
    
    for(let race of races){

        let statePostal = race.state?.postalCode;
        let id = (race.raceID || 0).toString();

        let ddRace = ddRaces.find(x => (x.id == id && x.state == statePostal));

        if(ddRace) race.lastWinningParty = ddRace.incumbent;

    }

}