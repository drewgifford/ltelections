import Race, { OfficeType } from "../types/Race";
import { getTopTwoCandidates } from "@/server/utils/Util";
import { erf } from "mathjs";
import { HistoricalCounty } from "../polling/HistoricalResult";
import ReportingUnit, { ReportingCandidate } from "../types/ReportingUnit";
import { PollingAverage } from "./PollingAverage";
const STANDARD_DEV = 0.04;

const NON_COUNTY_STATES = ["AK", "MA", "NH", "VT", "ME", "CT", "RI"];
const COUNTY_PROJECTION_RACES = [OfficeType.President, OfficeType.Senate, OfficeType.Governor];

export function hasProjectOMatic(race: Race){

    if(race.pollingAverage) return true;

    if(race.officeID == OfficeType.House && race.reportingUnits[0].cookPVI) {

        // Check if there's multiple
        let dem = race.candidates.filter(x => x.party == 'Dem');
        let gop = race.candidates.filter(x => x.party == 'GOP');

        if(dem.length > 1 || gop.length > 1) return false;
        if(dem.length > 0 && gop.length > 0) return true;
    };
    return false;

}

function getCandidateExpected(race: Race, candidate: ReportingCandidate, pollingAverage: PollingAverage, countyData: HistoricalCounty[]){


    if(
        !COUNTY_PROJECTION_RACES.includes(race.officeID as any) ||
        NON_COUNTY_STATES.includes(race.state?.postalCode as any)
    ) {

        let expected = pollingAverage[candidate.polID || '']?.average;
        return (1-race.eevp/100)*(expected * (race.parameters.vote?.expected.actual || 0)) + (race.candidates.find(x => x.polID == candidate.polID)?.voteCount || 0);
    }

    // Otherwise, build an expected vote total by county
    let expected = race.reportingUnits.reduce((ex: number, ru: ReportingUnit) => {

        if(ru.reportingunitLevel != 2) return ex;

        let county = countyData.find(x => x.county_fips == ru.fipsCode);
        let swing = 0;
        if(county) swing = county.swing;

        let expectedCountyVote = pollingAverage[candidate.polID].average;

        let demCandidate = race.candidates.find(x => x.party == 'Dem');
        let gopCandidate = race.candidates.find(x => x.party == 'GOP');

        // Determine whether or not to treat this candidate as a left-leaning candidate or right-leaning
        if(candidate.party == 'Dem' && demCandidate && demCandidate.polID == candidate.polID) {
            expectedCountyVote * (1+swing/2);
        }
        else if (candidate.party == 'GOP' && gopCandidate && gopCandidate?.polID == candidate.polID) {
            expectedCountyVote * (1+swing/2);
        }

        // If there's a GOP in the race at all and no Dem
        else if (race.candidates.length == 2 && gopCandidate && !demCandidate) {
            expectedCountyVote *= (1+swing/2);
        }

        // If there's a Dem in the race and no GOP
        else if (race.candidates.length == 2 && demCandidate && !gopCandidate){
            expectedCountyVote *= (1+swing/2);
        }


        let expectedVote = (1-ru.eevp/100)*(expectedCountyVote * (ru.parameters.vote?.expected.actual || 0)) + (ru.candidates.find(x => x.polID == candidate.polID)?.voteCount || 0);

        return ex + expectedVote;

    }, 0);


    

    return expected;


}

function getRaceProbability(race: Race, pollingAverage: PollingAverage, countyData: HistoricalCounty[]){

    // Check if the race is called
    let winner = race.candidates.find(x => x.winner == 'X');

    if(winner){
        let probs: any = {};

        for(let candidate of race.candidates){
            probs[candidate.polID as string] = 0;
        }
        probs[winner.polID as string] = 1;

        return probs;

    }


    // Handle races with a polling average first
    let probs: any = {};
    if(pollingAverage){

        let candidates = race.candidates;

        for(let polID of Object.keys(pollingAverage)){

            let candidate = candidates.find(x => x.polID == polID);

            if(!candidate) continue;

            let expectedVoteTotal = getCandidateExpected(race, candidate, pollingAverage, countyData);

            let voteTotal = candidate.voteCount || 0;
            let pct = voteTotal / (race.parameters.vote?.expected.actual || 1);
            let expectedPct = expectedVoteTotal / (race.parameters.vote?.expected.actual || 1);

            let reportingPct = race.eevp / 100;

            var probabilities: number[] = [];

            
            

            for(let otherID of Object.keys(pollingAverage)){
                if(otherID == polID) continue;

                let otherCand = race.candidates.find(x => x.polID == otherID);
                if(!otherCand) continue;

                // Calculate against this candidate, store probabilities in an array and multiply them all together

                let otherExpectedVoteTotal = getCandidateExpected(race, otherCand, pollingAverage, countyData);

                

                let otherVoteTotal = otherCand.voteCount || 0;
                let otherPct = otherVoteTotal / (race.parameters.vote?.expected.actual || 1);
                let otherExpectedPct = otherExpectedVoteTotal / (race.parameters.vote?.expected.actual || 1);

                

                let margin = pct - otherPct;

                let marginNeeded = (-margin * reportingPct)/(1-reportingPct);


                let expectedMargin = ((1-reportingPct)*(expectedPct-otherExpectedPct)+(reportingPct*margin));

                

                let probability = 1-cdfNormal(marginNeeded, expectedMargin, STANDARD_DEV*2);

                probabilities.push(probability);

            }

            let prob = probabilities.reduce((prev: number, curr: number) => prev * curr, 1);
            
            probs[polID] = prob;
        }

        

    }
    
    

    // Normalize the data
    let total = Object.keys(probs).reduce((prev: number, curr: string) => prev + probs[curr], 0);

    for(let key of Object.keys(probs)){
        probs[key] = probs[key] / total;
    }

    return probs;

}



export function getRaceProbabilities(race: Race, COUNTY_DATA: HistoricalCounty[]){

    let pollingAverage = race.pollingAverage as PollingAverage;

    let candidates = getTopTwoCandidates(race);

    let dem = candidates.find(x => x.party == 'Dem');
    let gop = candidates.find(x => x.party == 'GOP');

    // Create a fake polling average from Cook PVI if there is a democrat and republican running in this race against each other and if this is a House race
    if(race.officeID == OfficeType.House && !pollingAverage && race.reportingUnits[0].cookPVI){

        if(dem && gop){

            let pvi = race.reportingUnits[0].cookPVI;

            pollingAverage = {}

            pollingAverage[dem.polID as string] = {
                average: 0.5 - pvi/200,
                includedPolls: 0
            }
            pollingAverage[gop.polID as string] = {
                average: 0.5 + pvi/200,
                includedPolls: 0
            }

        }
    }

    let probs = getRaceProbability(race, pollingAverage, COUNTY_DATA);

    return probs;
}

const LOCKED_STATES = {
    "AL": "",
    "AK": "",
    "AZ": "Harris",
    "AR": "",
    "CA": "",
    "CO": "",
    "CT": "",
    "DE": "",
    "DC": "",
    "FL": "Trump",
    "GA": "Harris",
    "HI": "",
    "ID": "",
    "IL": "",
    "IN": "",
    "IA": "",
    "KS": "",
    "KY": "",
    "LA": "",
    "ME": "",
    "ME-1": "",
    "ME-2": "",
    "MD": "",
    "MA": "",
    "MI": "Harris",
    "MN": "",
    "MS": "",
    "MO": "",
    "MT": "",
    "NE": "",
    "NE-1": "",
    "NE-2": "Harris",
    "NE-3": "",
    "NV": "Harris",
    "NH": "",
    "NJ": "",
    "NM": "",
    "NY": "",
    "NC": "Harris",
    "ND": "",
    "OH": "",
    "OK": "",
    "OR": "",
    "PA": "Harris",
    "RI": "",
    "SC": "",
    "SD": "",
    "TN": "",
    "TX": "Harris",
    "UT": "",
    "VT": "",
    "VA": "",
    "WA": "",
    "WV": "",
    "WI": "Harris",
    "WY": ""
}
function runIndividualSimulation(races: Race[]){

    const TOTAL_EVS = 538;
    const TO_WIN = 270;
    let dp: {[key: string]: number[]} = {};

    races.forEach((race) => {
    let votes = race.reportingUnits[0].electTotal as number;

    for(let candidate of race.candidates){

        let polID = candidate.polID as string;

        // Set up DP table
        if(!(Object.keys(dp).includes(polID))){
            dp[polID] = Array(TOTAL_EVS + 1).fill(0);
            dp[polID][0] = 1;
        }

        let candDP = dp[polID];
        let probability = candidate.probability;

        for(let i = TOTAL_EVS - votes; i >= 0; i--){
            candDP[i+votes] += (candDP[i] * probability);
            candDP[i] *= (1-probability);
        }
    }

    });

    let ret: {[key: string]: number} = {};

    for (let polID of Object.keys(dp)){

        let candDP = dp[polID];
        let probability = 0;


        for(let i = TO_WIN; i <= TOTAL_EVS; i++){
            probability += candDP[i];
        }

        ret[polID] = probability;
    }

    console.log(ret);

    return ret;

}

export function presidentialProbability(presRace: Race, races: Race[], countyData: HistoricalCounty[]){

    const SIMULATIONS = 50;
    const TOTAL_EVS = 538;
    const TO_WIN = 270;
    let dp: {[key: string]: number[]} = {};


    

    let rs = races.slice();

    // Generate national expected popular vote
    let popularVote: {[key: string]: number} = {};
    let total = 0;

    //let pa = rs.find(x => x.state?.postalCode == 'PA');
    /*for(let race of rs){


        let stateLabel = race.state?.postalCode;
        if(race.seatNum){
            stateLabel = `${stateLabel}-${race.seatNum}`;
        }



        if(Object.keys(LOCKED_STATES).includes(stateLabel)){

            let winner = LOCKED_STATES[stateLabel];

            let winnerCand = race.candidates.find(x => x.last == winner);

            if(winnerCand){
                winnerCand.winner = 'X';
            }


        }

    }*/

    for(let race of rs){

        for(let candidate of race.candidates){
            let polID = candidate.polID as string;
            if(!Object.keys(popularVote).includes(polID)) popularVote[polID] = 0;

            if(!Object.keys(race.pollingAverage).includes(polID)) continue;

            let n = getCandidateExpected(race, candidate, race.pollingAverage, countyData);
            popularVote[polID] += n;
            total += n;
        }

    }

    let gopPolID = presRace.candidates.find(x => x.party == 'GOP')?.polID || "";
    let demPolID = presRace.candidates.find(x => x.party == 'Dem')?.polID || "";

    function runSimulation(pollingAverageAdjustment: number){
        
        let rs1 = deepCopy(rs);

        for(let race of rs1){


            // Check if this race is called
            let winner = race.candidates.find(x => x.winner == 'X')
            if(winner){
                
                for(let candidate of race.candidates){
                    candidate.probability = 0;
                }
                winner.probability = 1;
                continue;
            }

            let pollingAverage = race.pollingAverage as PollingAverage;

            if(Object.keys(pollingAverage).includes(gopPolID)){
                pollingAverage[gopPolID].average += pollingAverageAdjustment;
            }
            if(Object.keys(pollingAverage).includes(demPolID)){
                pollingAverage[demPolID].average -= pollingAverageAdjustment;
            }

            let probs = getRaceProbabilities(race, countyData);

            for(let key of Object.keys(probs)){
                let cand = race.candidates.find(x => x.polID == key);
                if(cand) cand.probability = probs[key];
            }

        }
        // Run nationwide simulation

        let probs = runIndividualSimulation(rs1);
        return probs;

    }

    let probs: {[key: string]: number} = {};

    let stdDev = STANDARD_DEV;
    let start = stdDev * (-2);
    let end = stdDev * (2);
    let step = (end-start)/SIMULATIONS;

    let totalWeight = 0;

    for(let i = start; i <= end; i+=step){

        console.info("Simulation", i, "/", SIMULATIONS);

        let weight = cdfNormal(i+(step/2), 0, STANDARD_DEV)-cdfNormal(i-(step/2), 0, STANDARD_DEV);

        totalWeight += weight;

        let probSlice = runSimulation(i);

        for(let key of Object.keys(probSlice)){
            if(!Object.keys(probs).includes(key)) probs[key] = 0;
            probs[key] += probSlice[key] * weight;
        }

    }

    for(let candidate of presRace.candidates){

        let polID = candidate.polID as string;
        if(Object.keys(probs).includes(polID)){

            candidate.probability = probs[polID]/totalWeight;

            console.log(candidate.last, candidate.probability);
        }
        

    }
    presRace.hasProjectomatic = true;
}

export function roundPercentage(pct: number, fixed?: number){

    if(fixed == null || fixed == undefined) fixed = 2;

    

    if(pct > 0.99){
        return ">99%";
    }
    if(pct < 0.01){
        return "<1%";
    }

    return (pct*100).toFixed(fixed) + "%";

}

function cdfNormal (x: number, mean: number, standardDeviation: number) {
    return (1 - erf((mean - x ) / (Math.sqrt(2) * standardDeviation))) / 2
}

const deepCopy = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
}

function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}