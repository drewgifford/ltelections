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

                

                let probability = 1-cdfNormal(marginNeeded, expectedMargin, STANDARD_DEV);

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


export function presidentialProbability(presRace: Race, races: Race[]){

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

    // US-wide race object
    for (let candidate of presRace.candidates){

        let polID = candidate.polID as string;
        let candDP = dp[polID];
        let probability = 0;

        

        for(let i = TO_WIN; i <= TOTAL_EVS; i++){
            probability += candDP[i];
        }

        candidate.probability = probability;
        presRace.hasProjectomatic = true;
    }




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