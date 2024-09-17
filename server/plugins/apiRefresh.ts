import cron from "node-cron";
import Race from "../Race";
import State from "../State";

const REFRESH_TIME = 60

const gatherOtherData = async (date: string, json: any) => {

    let postalsTaken: string[] = [];
    let states: State[] = [];

    for(var race of json.races as Race[]){

        console.log((race as any).candidates);

        if(!("reportingUnits" in race)) continue;

        

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

export default defineNitroPlugin((nitroApp) => {

    var nextReqDates: any = {}


    // Automatically refresh the database with all races every REFRESH_TIME seconds
    cron.schedule(`*/${REFRESH_TIME} * * * * *`, async () => {

        // Grab AP API data and cache in redis database based on election date
        var dates = [process.env.ELECTION_DATE || ""]
        const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];

        console.log("Updating races for " + dates + "...")

        for(var date of dates){

            var nextReqDate = date in Object.keys(nextReqDates) ? nextReqDates[date] : "";

            let reqQuery = `https://api.ltelections.com/?resultsType=t&level=fipscode&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${process.env.LTE_API_KEY}${nextReqDate}`;

            try {
                let res = await fetch(reqQuery);
                let json = await res.json();

                // TODO : Populate races with LTE data (whether or not we have a forecast available, candidate images, etc.)
                await gatherOtherData(date, json);

                useStorage("redis").setItem(date, json);

                if (json.nextrequest) {
                    nextReqDates[date] = "&minDateTime=" + json.nextrequest.split("&minDateTime=")[1];
                }

                console.log(Date.now() + " | Updated races for date " + date);
            } catch (e) {
                
                console.error(e)
            }
        }

        
        
    });


})
