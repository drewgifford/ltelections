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

export function getTopTwoCandidates(unit: Raw<Race> | Raw<ReportingUnit>, race?: Raw<Race>) {

    let candidates = unit.candidates;
  
    if(candidates.length <= 1) return [candidates[0], null];
  
    let republican = candidates.find(cand => cand.party == "GOP");
    let democrat = candidates.find(cand => cand.party == "Dem");
  
    // First action - try polling data
  
    // Second strategy - Check for an incumbent
    let incumbents = race ? race.incumbents : (unit instanceof Race ? unit.incumbents : []);
  
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