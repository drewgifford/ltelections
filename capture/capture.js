import { outputFileSync } from "fs-extra/esm";
import cron from "node-cron";
import yoctoSpinner from "yocto-spinner";
import dotenv from "dotenv";

dotenv.config();

var nextReqDates = {}
const extractFolder = "capture/captures";
let index = 0;
const REFRESH_TIME = 3; // MINUTES
const date = "2024-11-05"

var isWorking = false;

console.info(`Capturing requests...`)

async function makeRequest(){

    if(isWorking) return;
    isWorking = true;

    let spinner = yoctoSpinner({ text: `Capturing request #${index}...` }).start();

    let nextReqDate = date in Object.keys(nextReqDates) ? nextReqDates[date] : "";
    const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];



    let req = `https://api.ltelections.com/?resultsType=t&level=ru&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${process.env.LTE_API_KEY}${nextReqDate}`;
    
    spinner.text = `Fetching #${index}...`

    let res = await fetch(req);

    spinner.text = `Parsing #${index}...`

    let json = await res.json();

    spinner.text = `Saving #${index}...`

    outputFileSync(`${extractFolder}/capture-${index}.json`, Buffer.from(JSON.stringify(json)));

    spinner.text = `Request #${index} captured.`

    spinner.success();
    index++;
    isWorking = false;

}

cron.schedule(`0 */${REFRESH_TIME} * * * *`, async () => {

    await makeRequest();
    
});


