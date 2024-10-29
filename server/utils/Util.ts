import { Raw } from "vue";
import Race, { OfficeType } from "../types/Race";
import ReportingUnit, { ReportingCandidate } from "../types/ReportingUnit";
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

export function filterDuplicateRaces(races: Race[]){

  return races.filter(race => {
    // If this race is a special election and there is another race with the same seat number of the same office type and same state
    let val = !(race.raceType?.includes('Special') && races.find(x => !x.raceType?.includes('Special') && (x.seatNum == race.seatNum) && (x.officeID == race.officeID) && (x.stateID == race.stateID)));

    return val;
  });

}

export function sortCandidates(candidates: ReportingCandidate[]){

  let incumbent = candidates.find(cand => cand.incumbent);


  return candidates.toSorted((a: ReportingCandidate, b: ReportingCandidate) => {

    if((a.voteCount || 0) > (b.voteCount || 0)) return -1;
    if((a.voteCount || 0) < (b.voteCount || 0)) return 1;

    if(a.probability > b.probability) return -1;
    if(a.probability < b.probability) return 1;

    if(a.incumbent) return -1;

    if(a.party == 'Dem' || a.party == 'GOP') return -1;
    return 1;


  })


}

export function getMostLikelyCandidate(race: Race){
  return race.candidates.reduce((prev: ReportingCandidate, curr: ReportingCandidate) => curr.probability > prev.probability ? curr : prev);
}

export function getTopTwoCandidates(unit: Raw<Race> | Raw<ReportingUnit>) {
    return sortCandidates(unit.candidates).slice(0, 2);
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

export function officeTypeToString(officeID: OfficeType){

  switch(officeID){
    case OfficeType.Senate:
      return "senate";
    case OfficeType.President:
      return "president";
    case OfficeType.House:
      return "house";
    case OfficeType.Governor:
      return "governor";
    case OfficeType.BallotMeasure:
      return "measure";
    default:
      return "any";
  }
  
}

export function officeTypeFromString(officeID: string){

  switch(officeID.toLowerCase()){
    case "senate":
      return OfficeType.Senate;
    case "president":
      return OfficeType.President;
    case "house":
      return OfficeType.House;
    case "governor":
      return OfficeType.Governor;
    case "measure":
      return OfficeType.BallotMeasure;
    default:
      return OfficeType.Any;
                                    
  }

}

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


export function getRaceURL(year: string, race: Race) {
  let r = getOfficeURL(race);

  let s = "";
  if(race.raceType?.includes("Special")){
      s = "-special";
  }

  return `/results/${year}/${race.state?.name?.toLowerCase().replace(' ','-')}/${r}${s}`;
}