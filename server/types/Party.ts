//import { getPartyData } from "../plugins/apiRefresh";
import { xgcd } from "mathjs";
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
                    colors: ["#0041E9","#5F85FF","#9FB5FF","#B2B8D1"],
                    shorthand: "D"
                },
                {
                    id: "GOP",
                    name: "Republican",
                    demonym: "Republican",
                    colors: ["#E7004A","#FF7392","#FFA9B6","#CFAAA2"],
                    shorthand: "R"
                },
                {
                    id: "Ind",
                    name: "Independent",
                    demonym: "Independent",
                    colors: ["#8222A6","#8222A6","#8222A6","#8222A6"],
                    shorthand: "I"
                },
                {
                    id: "Yes",
                    name: "Yes",
                    demonym: "Supporter",
                    colors: ["#0CA14D","#33D77A","#63FDA6","#68A181"],
                    shorthand: "✓"
                },
                {
                    id: "No",
                    name: "No",
                    demonym: "Opponent",
                    colors: ["#E7004A","#FF7392","#FFA9B6","#CFAAA2"],
                    shorthand: "✖"
                }
            ];

            let party = partyData.find(x => x.id == props);

            if(!party){
                party = {
                    id: props,
                    name: "Independent",
                    demonym: "Independent",
                    colors: ["#8222A6","#8222A6","#8222A6","#8222A6"],
                    shorthand: "I"
                }
            }

            if(party){
                Object.assign(this, party);
            }

        }
        else {
            Object.assign(this, props);
        }


    }


}