import cron from "node-cron";
import Race, { getRaceById, getUniqueRaceId, raceIsEqual } from "../Race";
import State from "../State";
import { Redis } from "ioredis";
import ApiResponse from "../types/ApiResponse";
import yoctoSpinner from "yocto-spinner";
import { setCandidateData } from "../utils/CandidateData";
import { JSONFilePreset } from 'lowdb/node'





const REFRESH_TIME = 60


type CandidateData = {
    name: string,
    image: string,
    description: string | null,
    id: number
}
let candidateData: CandidateData[] = [];
let apiResponse: ApiResponse;

export function getApiResponse(){
    return apiResponse;
}
export function getCandidateData(){
    return candidateData;
}
export function getPartyData(){
    return [
        {
            id: "Dem",
            name: "Democratic",
            demonym: "Democrat",
            colors: ["#00000ff"]
        },
        {
            id: "GOP",
            name: "Republican",
            demonym: "Republican",
            colors: ["#ff0000"]
        },
        {
            id: "Yes",
            name: "Yes",
            demonym: "Supporter",
            colors: ["#00ff00"]
        },
        {
            id: "No",
            name: "No",
            demonym: "Opponent",
            colors: ["#ff0000"]
        }
    ]
}



export default defineNitroPlugin(async (nitroApp) => {

    const db = await JSONFilePreset('@/db/apiCache.json', { response: {} })

    var nextReqDates: any = {}

    // === Grab candidate data
    const setupCandidateData = async () => {

        console.info("Setting up candidate data...")
        let req = `https://api.ltelections.com/candidates/`;
        let res = await fetch(req);
        let json = await res.json();
        
        setCandidateData(json);

        console.info("✔ Done");
    }

    const setupAPData = async () => {
        console.info("Setting up AP data...")
        let date = '2024-11-05';
        let nextReqDate =  date in Object.keys(nextReqDates) ? nextReqDates[date] : "";
        const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];
        
        //TODO: I know i spent all day converting everything to classes, but you need to convert it to types or interfaces :(
        let req = `https://api.ltelections.com/?resultsType=t&level=ru&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${process.env.LTE_API_KEY}${nextReqDate}`;
        let res = await fetch(req);
        let json = await res.json();
        
        apiResponse = new ApiResponse(json);

        /* Use .nextrequest per AP standard */
        if (apiResponse.nextrequest) {
            nextReqDates[date] = "&minDateTime=" + apiResponse.nextrequest.split("&minDateTime=")[1];
        }

        //await db.update(({response}) => apiResponse);
        //useStorage('redis').setItem(date, apiResponse.toJSON());

        console.info("✔ Done");
    }
    

    // Automatically refresh the database with all races every REFRESH_TIME seconds
    cron.schedule(`*/${REFRESH_TIME} * * * * *`, async () => {

        await setupCandidateData();
        await setupAPData();
        



        // Grab AP API data and cache in redis database based on election date
        /*var dates = [process.env.ELECTION_DATE || ""]
        const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];

        console.log("Updating races for " + dates + "...")

        for(var date of dates){

            var nextReqDate = date in Object.keys(nextReqDates) ? nextReqDates[date] : "";

            let reqQuery = `https://api.ltelections.com/?resultsType=t&level=fipscode&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${process.env.LTE_API_KEY}${nextReqDate}`;

            try {
                let res = await fetch(reqQuery);
                let json = await res.json();

                let apiResponse = new ApiResponse(json);

                // TODO : Populate races with LTE data (whether or not we have a forecast available, candidate images, etc.)
                // TODO !important : Use FULL fipscode data and separate out into data needed for the Mini Race View search and full data, separated out into individual
                // redis keys
                //await gatherOtherData(date, json);

                //useStorage("redis").setItem(date, json);

                if (json.nextrequest) {
                    nextReqDates[date] = "&minDateTime=" + json.nextrequest.split("&minDateTime=")[1];
                    console.log(json.nextrequest);
                }

                console.log(Date.now() + " | Updated races for date " + date);

            } catch (e) {
                
                console.error(e)
            }
        }*/

        
        
    });


})
