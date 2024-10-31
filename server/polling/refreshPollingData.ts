import axios from "axios";
import Poll, { PollCandidate, RawPoll } from "./Poll";
import csv from "csvtojson";
import { parseHistoricalData } from "./HistoricalResult";
import cron from "node-cron";

const PRESIDENTIAL_URL = "https://projects.fivethirtyeight.com/polls-page/data/president_polls.csv";
const SENATE_URL = "https://projects.fivethirtyeight.com/polls/data/senate_polls.csv";
const HOUSE_URL = "https://projects.fivethirtyeight.com/polls/data/house_polls.csv";
const REFRESH_TIME = 5; // Minutes



export default async function() {

  const runtimeConfig = useRuntimeConfig();


  console.info("Refreshing polling data...");


    console.info("Parsing Presidential polls...")
    const PRESIDENT_POLLS = await parsePolls(PRESIDENTIAL_URL);
    console.info("Saving Presidential polls...", PRESIDENT_POLLS.length)
    await useStorage().setItem("polls.president", JSON.stringify(PRESIDENT_POLLS));
    

    console.info("Parsing Senate polls...")
    const SENATE_POLLS = await parsePolls(SENATE_URL);
    console.info("Saving Senate polls...")
    await useStorage().setItem("polls.senate", JSON.stringify(SENATE_POLLS));

    console.info("Parsing House polls...")
    const HOUSE_POLLS = await parsePolls(HOUSE_URL);
    console.info("Saving House polls...")
    await useStorage().setItem("polls.house", JSON.stringify(HOUSE_POLLS));

    console.info("Parsing County data...")
    const COUNTY_DATA = await parseHistoricalData();
    console.info("Saving County data...")
    await useStorage().setItem("polls.countyData", JSON.stringify(COUNTY_DATA));

    console.info("Done!");

    return Response.json({
      success: true
    });

};

async function parsePolls(url: string){

  // Just for testing, we will do presidential data

  const response = await axios.get(url, { responseType: "blob" });

  const rawPolls: RawPoll[] = await csv().fromString(await response.data);

  console.log(rawPolls.length);

  let parsedPolls: { [key: string]: Poll[] } = {};

  for(let poll of rawPolls){

      

      if(!poll.state || poll.state == "") poll.state = "National";

      if(Number(poll.seat_number) != 0 && !poll.state.includes('-')) poll.state = `${poll.state}-${poll.seat_number}`;

      //if(poll.seat_number) console.log(poll.state);

      /* Filter only polls we want */
      //if(poll.population != "lv") continue;

      let statePolls: Poll[] = parsedPolls[poll.state] || [];

      let existingPoll = statePolls.find(x => {
          return (x.question_id == poll.question_id);
      });
      

      let addToList = existingPoll ? false : true;
      
      if(!existingPoll) existingPoll = poll as any as Poll;

      let cand: PollCandidate = {
          answer: poll.answer as string,
          candidate_name: poll.candidate_name as string,
          pct: poll.pct as number,
          party: poll.party as string
      }

      if(!existingPoll.results) existingPoll.results = [];
      existingPoll.results.push(cand);

      delete poll["answer"];
      delete poll["candidate_name"];
      delete poll["pct"];


      if(addToList) {

          if(!(Object.keys(parsedPolls).includes(poll.state))) parsedPolls[poll.state] = [];

          parsedPolls[poll.state].push(existingPoll);

      };
  }

  console.log(Object.keys(parsedPolls), "Polls processed");

  return parsedPolls;

}
