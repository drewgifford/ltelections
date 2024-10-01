import { Raw } from "vue";
import Race from "../types/Race";
import ReportingUnit from "../types/ReportingUnit";

export function notZero(n: number | undefined) {

    if(!n) return 1;
  
    n = +n;  // Coerce to number.
    if (!n) {  // Matches +0, -0, NaN
      throw new Error('Invalid dividend ' + n);
    }
    return n;
}

export function nth(d: number) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
};

export function sortedCandidates(unit: Raw<Race> | Raw<ReportingUnit>){

  // Get candidates, place top two automatically at the top and sort the remainder.
  if(unit.parameters.vote && unit.parameters.vote.total > 0){

    let candidates = unit?.candidates;
    let topTwo = getTopTwoCandidates(unit);

    for(let cand of topTwo) candidates.splice(candidates.indexOf(cand), 1);

    return topTwo.concat(candidates.sort((a,b) => b.ballotOrder - a.ballotOrder));

  }
  else {

    return unit.candidates.sort((a,b) => b.voteCount - a.voteCount);

  }

}

export function getTopTwoCandidates(unit: Raw<Race> | Raw<ReportingUnit>) {

    let candidates = unit.candidates;
  
    if(candidates.length <= 1) return [candidates[0]];
  
    let republican = candidates.find(cand => cand.party == "GOP");
    let democrat = candidates.find(cand => cand.party == "Dem");
  
    // First action - try polling data
  
    // Second strategy - Check for an incumbent
    //let incumbents = race ? race.incumbents : (unit instanceof Race ? unit.incumbents : []);
    let incumbents = unit.candidates.filter(cand => cand.incumbent);
  
    if(incumbents.length > 0){
  
      let incumbent = incumbents[0];
  
      let incumbentData = candidates.find(cand => cand.polID == incumbent.polID);
      let incumbentParty = incumbentData?.party || '';
  
      // If the incumbent is actually running
      if(incumbentData) {
        // If there is both a democrat and republican in this race, and the incumbent is independent
        if (democrat && republican && !["Dem","GOP"].includes(incumbentParty)) return [incumbentData, republican];
  
        // If there is a democrat in this race and the incumbent is republican
        else if(democrat && incumbentParty == 'GOP') return [democrat, incumbentData];
        else if(republican && incumbentParty == 'Dem') return [incumbentData, republican]
        else return [incumbentData, candidates.find(cand => cand.polID != incumbent.polID) as Candidate];
      }
    }
  
    // Third strategy - Pair D and R
    
  
    if(republican && democrat){
      // Both parties have been found, return both
      return [democrat, republican];
    }
  
  
    // Fourth strategy - Alphabetical order
    return [candidates[0], candidates[1]];
  
  }