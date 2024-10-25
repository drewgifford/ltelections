import { Raw } from "vue";
import Race, { OfficeType } from "../types/Race";
import ReportingUnit from "../types/ReportingUnit";
import Color from "../types/Color";

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

    let yes = candidates.find(cand => cand.party == 'Yes');
    let no = candidates.find(cand => cand.party == 'No');

    if(yes && no){
      return [yes, no];
    }
  
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

var hex = function(x: any) {
  x = x.toString(16);
  let ret = (x.length == 1) ? '0' + x : x;

  if(ret == '100') return 'ff';
  return ret;
};

export function getBlendedColor(color1: Color, color2: Color, d: number){
  var r = Math.ceil(parseInt(color1.substring(1,3), 16) * d + parseInt(color2.substring(1,3), 16) * (1-d));
  var g = Math.ceil(parseInt(color1.substring(3,5), 16) * d + parseInt(color2.substring(3,5), 16) * (1-d));
  var b = Math.ceil(parseInt(color1.substring(5,7), 16) * d + parseInt(color2.substring(5,7), 16) * (1-d));

  return `#${hex(r)}${hex(g)}${hex(b)}`;

}

export function getBlendedMapColor(colors: Color[], threshold: number){

  

  let color1;
  let color2;

  if(threshold <= 0.02){
    color1 = colors[3];
    color2 = colors[2];
    threshold = threshold / 0.02;
  }
  else if (threshold <= 0.075){
    color1 = colors[1];
    color2 = colors[2];
    threshold = (threshold - 0.02) / (0.075-0.02)
  }
  else if (threshold <= 0.4){
    color1 = colors[0];
    color2 = colors[1];
    threshold = (threshold - 0.075) / (0.4-0.075)
  } else {
    color1 = colors[0];
    color2 = colors[0];
    threshold = 1;
  }

  var r = Math.ceil(parseInt(color1.substring(1,3), 16) * threshold + parseInt(color2.substring(1,3), 16) * (1-threshold));
  var g = Math.ceil(parseInt(color1.substring(3,5), 16) * threshold + parseInt(color2.substring(3,5), 16) * (1-threshold));
  var b = Math.ceil(parseInt(color1.substring(5,7), 16) * threshold + parseInt(color2.substring(5,7), 16) * (1-threshold));

  return `#${hex(r)}${hex(g)}${hex(b)}`



};

export function getOfficeURL(race: Race){
  switch(race.officeID){
    case OfficeType.Senate:
        return "senate";
    case OfficeType.President:
        return "president";
    case OfficeType.Governor:
        return "governor";
    case OfficeType.House:
        return `house-${race.seatNum}`;
    case OfficeType.BallotMeasure:
        return `issue-${race.designation}`;
    default:
        return `unknown`;
  }
}
export function getOfficeTypeFromOfficeURL(officeUrl: string){

  if(officeUrl.includes("senate")) return OfficeType.Senate;
  else if (officeUrl.includes("president")) return OfficeType.President;
  else if (officeUrl.includes("governor")) return OfficeType.Governor;
  else if (officeUrl.includes("house")) return OfficeType.House;
  else if (officeUrl.includes("issue")) return OfficeType.BallotMeasure;
  else {
    return null;
  }
}