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
import raceActive from "./raceActive";
import axios from "axios";

type CandidateData = {
  name: string,
  image: string,
  description: string | null,
  id: number
}
let apiResponse: ApiResponse;

let testDataPath = "/capture/captures";

const runtimeConfig = useRuntimeConfig();
const USING_TEST_DATA = runtimeConfig.env.TEST_DATA == '1';
const REFRESH_TIME = (USING_TEST_DATA ? 10 : 30);
const LTE_API_KEY = runtimeConfig.env.LTE_API_KEY;



const setupCandidateData = async () => {

  console.info("Reading candidate data...");
  
  let r: any = [];

  await axios.get(`https://api.ltelections.com/candidates/`, { responseType: 'json', timeout: 30000, timeoutErrorMessage: 'LTE API Request timed out.' })
  .then((response) => {
      console.info(`Got a response with status`, response.status);
      r = response.data;
  })
  .catch((error) => {
      console.error(error.message);
  });
  return r;
 
  
}

const setupAPData = async (data: CandidateData[]) => {

  let nextReqDates = await useStorage().getItem("nextReqDates") as any || {};

  console.info("Setting up AP data...");
  let date = runtimeConfig.env.ELECTION_DATE;
  let nextReqDate =  date in Object.keys(nextReqDates) ? nextReqDates[date] : "";
  const allowedOfficeIDs = ["G", "H", "P", "S", "I", "L"];
  
  let json;
  
  if(!USING_TEST_DATA){

      let req = `https://api.ltelections.com/?resultsType=l&level=ru&statepostal=*&officeID=${allowedOfficeIDs.join(',')}&format=json&electionDate=${date}&apiKey=${LTE_API_KEY}${nextReqDate}`;
      

      console.info(req);
      // Use axios
      await axios.get(req, { responseType: 'json', timeout: 20000, timeoutErrorMessage: 'AP API Request timed out.' })
      .then((response) => {
          json = response.data;
          console.info(`Got a response with status`, response.status);
      })
      .catch((error) => {
          console.error(error.message);
      })

  } else {

      let testIndex = await useStorage().getItem("testIndex") as number;

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

      useStorage().setItem("testIndex", testIndex);
  }
  
  apiResponse = new ApiResponse(json);

  console.info(`Found ${apiResponse.races.length} races.`)

  // Manually attach candidate images here
  apiResponse.races = attachCandidateData(apiResponse.races, data);

  await attachPVI(apiResponse.races);
  await attachDecisionDeskData(apiResponse.races);


  /* Use .nextrequest per AP standard */
  if (apiResponse.nextrequest) {
      nextReqDates[date] = "&minDateTime=" + apiResponse.nextrequest.split("&minDateTime=")[1];

      useStorage().setItem("nextReqDates", nextReqDates);
  }

  let j = apiResponse.toJSON();

  useStorage().setItem(date, j);

  let racesActive = apiResponse.races.find(x => x.tabulationStatus == TabulationStatus.ActiveTabulation) != undefined;
  useStorage().setItem("racesActive", racesActive);

  console.info("✔ Done");
  return j;
}


export default defineEventHandler(async (event) => {

  const runtimeConfig = useRuntimeConfig();

  const authHeader = event.headers.get("authorization");
  if(authHeader !== `Bearer ${runtimeConfig.env.LTE_API_KEY}`){
    return new Response('Unauthorized', {
      status: 401,
    })
  };

  useStorage().setItem("testIndex", 0);
  // === Grab candidate data

  // Automatically refresh the database with all races every REFRESH_TIME seconds

  let data = await setupCandidateData();
  let apiResponse = await setupAPData(data);

  return Response.json({
    success: true
  });
})
