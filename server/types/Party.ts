//import { getPartyData } from "../plugins/apiRefresh";
import Color from "./Color";


export default class Party {

    id?: string
    name?: string
    demonym?: string
    colors: Color[] = []

    constructor(prop: Partial<Party> | string){

        if (typeof prop === "string"){
            // Parse as a string, read party db
            let partyData = [];

            let party = partyData.find(x => x.id == prop);

            if(party){
                Object.assign(this, party);
            }

        }
        else {
            Object.assign(this, prop);
        }


    }


}