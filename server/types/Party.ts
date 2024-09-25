//import { getPartyData } from "../plugins/apiRefresh";
import JsonObject from "../utils/JsonObject";
import Color from "./Color";


export default class Party extends JsonObject {

    id: string | null = null
    name: string | null = null
    demonym: string | null = null
    colors: Color[] = []

    constructor(props: Partial<Party> | string){
        super();

        if (typeof props === "string"){
            // Parse as a string, read party db
            let partyData = [
                {
                    id: "Dem",
                    name: "Democratic",
                    demonym: "Democrat",
                    colors: ["#0041E9"],
                    shorthand: "D"
                },
                {
                    id: "GOP",
                    name: "Republican",
                    demonym: "Republican",
                    colors: ["#E7004A"],
                    shorthand: "R"
                },
                {
                    id: "Yes",
                    name: "Yes",
                    demonym: "Supporter",
                    colors: ["#00ff00"],
                    shorthand: "✓"
                },
                {
                    id: "No",
                    name: "No",
                    demonym: "Opponent",
                    colors: ["#ff0000"],
                    shorthand: "✖"
                }
            ];

            let party = partyData.find(x => x.id == props);

            if(party){
                Object.assign(this, party);
            }

        }
        else {
            Object.assign(this, props);
        }


    }


}