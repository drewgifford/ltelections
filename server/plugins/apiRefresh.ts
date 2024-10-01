import cron from "node-cron";
import ApiResponse from "../types/ApiResponse";
import yoctoSpinner from "yocto-spinner";
import { JSONFilePreset } from 'lowdb/node'
import { attachCandidateData } from "../types/Candidate";





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

        let req = `https://api.ltelections.com/candidates/`;
        let res = await fetch(req);
        let json = await res.json();

        console.info("✔ Done");

        return json;
    }

    const setupAPData = async (data: CandidateData[]) => {
        console.info("Setting up AP data...")
        let date = '2024-11-05';
        let nextReqDate =  date in Object.keys(nextReqDates) ? nextReqDates[date] : "";
        const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];
        
        //TODO: I know i spent all day converting everything to classes, but you need to convert it to types or interfaces :(
        let req = `https://api.ltelections.com/?resultsType=t&level=ru&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${process.env.LTE_API_KEY}${nextReqDate}`;
        let res = await fetch(req);
        let json = await res.json();
        
        apiResponse = new ApiResponse(json);

        // Manually attach candidate images here
        apiResponse.races = attachCandidateData(apiResponse.races, data);

        /* Use .nextrequest per AP standard */
        if (apiResponse.nextrequest) {
            nextReqDates[date] = "&minDateTime=" + apiResponse.nextrequest.split("&minDateTime=")[1];
        }

        //await db.update(({response}) => apiResponse);
        let j = apiResponse.toJSON();
        useStorage().setItem(date, j);

        console.info("✔ Done");
        return j;

    }
    

    // Automatically refresh the database with all races every REFRESH_TIME seconds
    cron.schedule(`*/${REFRESH_TIME} * * * * *`, async () => {

        let data = await setupCandidateData();
        let apiResponse = await setupAPData(data);

        // Use historical county data to generate an expected vote total for each race
        let races = apiResponse.races;

        for(let race of races){
            
            

        }

        
        
    });


})
