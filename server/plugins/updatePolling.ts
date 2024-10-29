import axios from "axios";
import { RawPoll, Poll, PollCandidate } from "../polling/Poll";
import csv from "csvtojson";
import { parseHistoricalData } from "../polling/HistoricalResult";
import cron from "node-cron";

const PRESIDENTIAL_URL = "https://projects.fivethirtyeight.com/polls-page/data/president_polls.csv";
const SENATE_URL = "https://projects.fivethirtyeight.com/polls/data/senate_polls.csv";
const HOUSE_URL = "https://projects.fivethirtyeight.com/polls/data/house_polls.csv";
const REFRESH_TIME = 5; // Minutes

export default defineNitroPlugin(async (nitroApp) => {

    console.info("Refreshing polling data...");

    let historicalCountyData = await parseHistoricalData();

    useStorage().setItem("historicalData", historicalCountyData);
    // TODO: parse presidential polls, add senate + house polls, calculate expected result and standard deviation for all races (swing races without polls by national swing from 2020-2024)
    // default standard deviation: 4.0%
    console.info("Done!");


    async function updateData(){
        const PRESIDENT_POLLS = await parsePolls(PRESIDENTIAL_URL);
        const SENATE_POLLS = await parsePolls(SENATE_URL);
        const HOUSE_POLLS = await parsePolls(HOUSE_URL);

        
        const COUNTY_DATA = await parseHistoricalData();
        
        try {
            await useStorage().setItem("polls.house", HOUSE_POLLS);
            await useStorage().setItem("polls.president", PRESIDENT_POLLS);
            await useStorage().setItem("polls.senate", SENATE_POLLS);
            await useStorage().setItem("polls.countyData", COUNTY_DATA);
        } catch(e){};
    }

    updateData().then(() => cron.schedule(`* */${REFRESH_TIME} * * * *`, updateData));

    

});

export async function parsePolls(url: string){

    // Just for testing, we will do presidential data

    const response = await axios.get(url, { responseType: "blob" });

    const rawPolls: RawPoll[] = await csv().fromString(await response.data);
    const parsedPolls: { [key: string]: Poll[] } = {};

    for(let poll of rawPolls){

        

        if(!poll.state || poll.state == "") poll.state = "National";
        if(poll.seat_number && !poll.state.includes('-')) poll.state = `${poll.state}-${poll.seat_number}`;

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

    return parsedPolls;

}