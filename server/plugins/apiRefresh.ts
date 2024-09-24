import cron from "node-cron";
import Race, { getRaceById, getUniqueRaceId, raceIsEqual } from "../Race";
import State from "../State";
import { Redis } from "ioredis";
import ApiResponse from "../types/ApiResponse";
import yoctoSpinner from "yocto-spinner";

const REFRESH_TIME = 20

const gatherOtherData = async (date: string, json: any) => {

    let postalsTaken: string[] = [];
    let states: State[] = [];

    for(var race of json.races as Race[]){
        for(var reportingUnit of race.reportingUnits){

            let id = reportingUnit.statePostal;

            if(!postalsTaken.includes(id)){
                states.push({
                    name: reportingUnit.stateName,
                    postalCode: id,
                });
                postalsTaken.push(id);
            }
        }
    }

    setupOverviewJson(json);
    let countyJson = setupCountyMaps(json);
    countyJson.races.forEach(async (race: Race, index: number) => {

        let deepCopy = JSON.parse(JSON.stringify(countyJson));

        deepCopy.races = deepCopy.races.filter((r: Race) => raceIsEqual(r, race));

        console.log(`Race ${index}/${countyJson.races.length}`);

        //await useStorage('redis').setItem(`${date}-${getUniqueRaceId(race)}`, deepCopy);

    })
    
    



    await useStorage("redis").setItem(`${date}-states`, states);

    console.log(`Built out ${states.length} states.`);

    // TEMPORARY DATA
    let partyData = {

        parties: [
            {
                partyId: "Dem",
                shorthand: "D",
                name: "Democratic",
                demonym: "Democrat",
                color: "#0041E9"
            },
            {
                partyId: "GOP",
                shorthand: "R",
                name: "Republican",
                demonym: "Republican",
                color: "#E7004A"
            },
            {
                partyId: "IND",
                shorthand: "I",
                name: "Inpdenendent",
                demonym: "Independent",
                color: "#FFD300"
            },
            {
                partyId: "OTH",
                shorthand: "O",
                name: "Other",
                demonym: "Other",
                color: "#94A3B8"
            }
        ]



    }

    useStorage("redis").setItem("lteData", partyData);

    



}

const setupOverviewJson = (j: any) => {
    let json = JSON.parse(JSON.stringify(j)) // deep copy;
    let races = json.races as Race[];

    races.forEach((race: Race) => {
        // Filter reporting units to the first reportingunitlevel
        race.reportingUnits = race.reportingUnits.filter((reportingUnit) => reportingUnit.reportingunitLevel == 1);
    });

    return json;
}

const setupCountyMaps = (j: any) => {
    let json = JSON.parse(JSON.stringify(j));
    let races = json.races as Race[];

    races.forEach((race: Race, index: number) => {

        
        
        race.reportingUnits = race.reportingUnits.filter((reportingUnit) => reportingUnit.reportingunitLevel == 2);
    });

    return json;
}


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

export default defineNitroPlugin((nitroApp) => {

    var nextReqDates: any = {}


    // Automatically refresh the database with all races every REFRESH_TIME seconds
    cron.schedule(`*/${REFRESH_TIME} * * * * *`, async () => {


        // === Grab candidate data
        const setupCandidateData = async () => {

            console.info("Setting up candidate data...")
            let req = `https://api.ltelections.com/candidates/`;
            let res = await fetch(req);
            let json = await res.json();
            candidateData = json;

            console.info("✔ Done");
        }

        const setupAPData = async () => {
            console.info("Setting up AP data...")
            let date = '2024-11-05';
            let nextReqDate =  date in Object.keys(nextReqDates) ? nextReqDates[date] : "";
            const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];
            
            let req = `https://api.ltelections.com/?resultsType=t&level=ru&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${process.env.LTE_API_KEY}${nextReqDate}`;
            let res = await fetch(req);
            let json = await res.json();
            
            apiResponse = new ApiResponse(json);

            /* Use .nextrequest per AP standard */
            if (apiResponse.nextrequest) {
                nextReqDates[date] = "&minDateTime=" + apiResponse.nextrequest.split("&minDateTime=")[1];
            }

            useStorage().setItem(date, JSON.stringify(apiResponse));

            console.info("✔ Done");
        }


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
