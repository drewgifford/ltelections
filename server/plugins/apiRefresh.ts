import cron from "node-cron";
import ApiResponse from "../types/ApiResponse";
import yoctoSpinner from "yocto-spinner";
import { JSONFilePreset } from 'lowdb/node'
import { attachCandidateData } from "../types/Candidate";
import { HistoricalCounty } from "../polling/HistoricalResult";
import { OfficeType, TabulationStatus } from "../types/Race";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { attachPVI } from "../polling/CookPVI";
import { attachDecisionDeskData } from "../polling/DecisionDeskData";
import raceActive from "../api/raceActive";

console.log(process.env.TEST_DATA);

const USING_TEST_DATA = process.env.TEST_DATA == '1';

const REFRESH_TIME = (USING_TEST_DATA ? 10 : 30);


type CandidateData = {
    name: string,
    image: string,
    description: string | null,
    id: number
}
let candidateData: CandidateData[] = [];
let apiResponse: ApiResponse;

let testDataPath = "/capture/captures";

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

    var testIndex: number = 0;

    const db = await JSONFilePreset('@/db/apiCache.json', { response: {} })

    var nextReqDates: any = {}

    // === Grab candidate data
    const setupCandidateData = async () => {

        console.info("Reading candidate data...");

        let req = `https://api.ltelections.com/candidates/`;
        let res = await fetch(req);
        let json = await res.json();

        console.info("✔ Done");

        return json;
    }

    const setupAPData = async (data: CandidateData[]) => {

        console.info("Setting up AP data...");
        let date = '2024-11-05';
        let nextReqDate =  date in Object.keys(nextReqDates) ? nextReqDates[date] : "";
        const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];
        
        let json;
        
        if(!USING_TEST_DATA){

            let req = `https://api.ltelections.com/?resultsType=l&level=ru&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${process.env.LTE_API_KEY}${nextReqDate}`;
            let res = await fetch(req);
            json = await res.json();

        } else {

            let filePath = path.resolve(process.cwd()+`/${testDataPath}/capture-${testIndex}.json`);
            console.info(`Using test data`, filePath);

            if(!existsSync(filePath)) {
                testIndex = 0;
            }
            if(testIndex > 45) testIndex = 0;

            console.info(`File Exists`);

            const data = readFileSync(filePath, { encoding: 'utf8', flag: 'r' });

            json = JSON.parse(data);

            testIndex++;
        }
        
        apiResponse = new ApiResponse(json);

        // Manually attach candidate images here
        apiResponse.races = attachCandidateData(apiResponse.races, data);

        await attachPVI(apiResponse.races);
        await attachDecisionDeskData(apiResponse.races);


        /* Use .nextrequest per AP standard */
        if (apiResponse.nextrequest) {
            nextReqDates[date] = "&minDateTime=" + apiResponse.nextrequest.split("&minDateTime=")[1];
        }

        //await db.update(({response}) => apiResponse);
        let j = apiResponse.toJSON();

        useStorage().setItem(date, j);

        let racesActive = apiResponse.races.find(x => x.tabulationStatus == TabulationStatus.ActiveTabulation) != undefined;
        useStorage().setItem("racesActive", racesActive);

        console.info("✔ Done");
        return j;
    }
    

    // Automatically refresh the database with all races every REFRESH_TIME seconds

    async function updateApiData(){
        let data = await setupCandidateData();
        let apiResponse = await setupAPData(data);
    }

    updateApiData().then(async () => {
        cron.schedule(`*/${REFRESH_TIME} * * * * *`, updateApiData);
    })

    


})
