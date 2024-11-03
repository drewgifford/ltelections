import {Candidate, HasResults, Race, RaceReportingUnit} from "../types/ViewModel";
import OfficeType from "~/server/types/enum/OfficeType";
import moment from "moment-timezone";

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
}

export function filterDuplicateRaces(races: Race[]){

  return races.filter(race => {
    // If this race is a special election and there is another race with the same seat number of the same office type and same state
    return !(race.raceType?.includes('Special') && races.find(x => !x.raceType?.includes('Special') && (x.seatNum == race.seatNum) && (x.officeID == race.officeID) && (x.state.stateID == race.state.stateID)));
  });

}

export function sortCandidates(race: Race, unit?: HasResults){

  if(!unit) unit = race;

  let candidates = race.candidates.filter(x => keys(unit.results).includes(x.polID));
  let incumbent = race.incumbents.find(x => candidates.includes(x));


  return candidates.toSorted((a: Candidate, b: Candidate) => {

    let aResults = unit.results[a.polID];
    let bResults = unit.results[b.polID];

    if(aResults.vote > bResults.vote) return -1;
    if(aResults.vote < bResults.vote) return 1;

    if(aResults.probability && bResults.probability){
      if(aResults.probability > bResults.probability) return -1;
      if(aResults.probability < bResults.probability) return 1;
    }

    if(incumbent && incumbent.polID == a.polID) return -1;
    if(incumbent && incumbent.polID == b.polID) return 1;

    if(!(incumbent && incumbent.polID == b.polID) && (a.party.partyID == 'Dem' || a.party.partyID == 'GOP')) return -1;

    return 1;


  })
}

export function getMostLikelyCandidate(race: Race){
  return race.candidates.reduce((prev: Candidate, curr: Candidate) => race.results[curr.polID].probability > race.results[curr.polID].probability ? curr : prev);
}

export function getTopTwoCandidates(race: Race, unit?: RaceReportingUnit) {
    return sortCandidates(race, unit || race).slice(0, 2);
}

var hex = function(x: any) {
  x = x.toString(16);
  let ret = (x.length == 1) ? '0' + x : x;

  if(ret == '100') return 'ff';
  return ret;
};

export function getBlendedColor(color1: string, color2: string, d: number){
  var r = Math.ceil(parseInt(color1.substring(1,3), 16) * d + parseInt(color2.substring(1,3), 16) * (1-d));
  var g = Math.ceil(parseInt(color1.substring(3,5), 16) * d + parseInt(color2.substring(3,5), 16) * (1-d));
  var b = Math.ceil(parseInt(color1.substring(5,7), 16) * d + parseInt(color2.substring(5,7), 16) * (1-d));

  return `#${hex(r)}${hex(g)}${hex(b)}`;

}

export function getBlendedMapColor(colors: string[], threshold: number){

  

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
        return `${race.officeName.replace(' ','_').toLowerCase()}-${race.designation.replace(" ","_")}`;
    default:
        return `unknown`;
  }
}
export function getOfficeTypeFromOfficeURL(officeUrl: string){

  if(officeUrl.includes("senate")) return OfficeType.Senate;
  else if (officeUrl.includes("president")) return OfficeType.President;
  else if (officeUrl.includes("governor")) return OfficeType.Governor;
  else if (officeUrl.includes("house")) return OfficeType.House;
  else {
    return OfficeType.BallotMeasure;
  }
}


export function getRaceURL(year: string, race: Race) {
  let r = getOfficeURL(race);

  if(race.officeID == OfficeType.President && race.seatNum > 0){
    r +='-'+race.seatNum;
  }

  let s = "";
  if(race.raceType?.includes("Special")){
      s = "-special";
  }

  return `/results/${year}/${race.state?.name?.toLowerCase().replace(' ','-')}/${r}${s}`;
}

export const hasKey = (object: {[key: string]: any}, key: string) => {
  if (!Object.keys(object).includes(key)) return null;
  else return object[key];
}

export const keys = (object: {[key: string]: any}) => {
  return Object.keys(object);
}

export const setKeyDefault = <T>(object: {[key: string]: T}, key: string, value: T) => {
  if(!hasKey(object, key)){
      object[key] = value;
  }
}

export const redisToArray = (documents: any[]) => {
  return documents.map(document => document.value);
}

export const keyBy = <T>(objects: any[], key: T) =>{
  let obj: any = {};
  for(let o of objects) {
      obj[o[key]] = o;
  }
  return obj;
}

export const getVotes = (race: HasResults, candidate: Candidate) => {
  if(hasKey(race.results, candidate.polID)){
    return race.results[candidate.polID].vote;
  }
  return 0;
}
export const getProbability = (race: HasResults, candidate: Candidate) => {
  if (hasKey(race.results, candidate.polID)) {
    return race.results[candidate.polID].probability || 0;
  }
  return 0;
}

export const getTopReportingUnit = (race: Race) => {
  return Object.values(race.reportingUnits)[0];
}

export function getDemAndGOP(race: Race){

  let topTwo = race.candidates.slice(0, 2);


  if(topTwo[0].party.partyID != 'GOP'){
    return {
      dem: topTwo[0],
      gop: topTwo[1]
    }
  } else {
    return {
      dem: topTwo[1],
      gop: topTwo[0]
    }
  }
}

const OFFICE_HIERARCHY = [OfficeType.President, OfficeType.Governor, OfficeType.Senate, OfficeType.House, OfficeType.BallotMeasure];

export const sortRaces = (races: Race[]) => {

  return races.sort((a,b) => {

    if(a.state.stateID > b.state.stateID) return -1;
    if(a.state.stateID < b.state.stateID) return 1;

    if(!OFFICE_HIERARCHY.includes(a.officeID as OfficeType)) return 1;
    if(!OFFICE_HIERARCHY.includes(b.officeID as OfficeType)) return -1;

    if(OFFICE_HIERARCHY.indexOf(a.officeID as OfficeType) > OFFICE_HIERARCHY.indexOf(b.officeID as OfficeType)) return 1;
    if(OFFICE_HIERARCHY.indexOf(a.officeID as OfficeType) < OFFICE_HIERARCHY.indexOf(b.officeID as OfficeType)) return -1;

    if(a.officeID == b.officeID && a.officeID == OfficeType.House){
      if(a.seatNum > b.seatNum) return 1;
      if(a.seatNum < b.seatNum) return -1;
    }
    else if(a.officeID == b.officeID && a.officeID == OfficeType.BallotMeasure){

      let aNumber = Number(a.designation);
      let bNumber = Number(b.designation);

      if(aNumber && bNumber){
        if(aNumber > bNumber) return 1;
        if(aNumber < bNumber) return -1;
        return 0;
      }
      else if(aNumber && !bNumber) return 1;
      else if(!aNumber && bNumber) return -1;
      else {
        if(a.designation < b.designation) return -1;
        if(a.designation < b.designation) return 1;
      }

    }

    return 0;

  });

}

export const parseDateString = (dateStr: string) => {
  let date = new Date(dateStr);

  return moment.tz(date, "America/New_York").format("MM/DD @ hh:mmA z")

}


export const getCallText = (race: Race) => {
  if(!race.call.winner) return {
    caller: "",
    calls: {},
    decisionDesk: false,
  };

  const call = race.call;
  let agencies = keys(call.calls);

  let caller = agencies.includes('LTE') ? 'LTE' : 'AP'
  let callerLabel = caller;

  if(caller == 'LTE') callerLabel = 'LTE Decision Desk';

  return {
    callerLabel: callerLabel,
    caller: caller,
    calls: call.calls,
  }

}

export function redisReplace(value: string) {
  const replacements: {[key: string]: string} = {
    ',': '\\,',
    '<': '\\<',
    '>': '\\>',
    '{': '\\{',
    '}': '\\}',
    '[': '\\[',
    ']': '\\]',
    '"': '\\"',
    "'": "\\'",
    ':': '\\:',
    ';': '\\;',
    '!': '\\!',
    '@': '\\@',
    '#': '\\#',
    '$': '\\$',
    '%': '\\%',
    '^': '\\^',
    '&': '\\&',
    '*': '\\*',
    '(': '\\(',
    ')': '\\)',
    '-': '\\-',
    '+': '\\+',
    '=': '\\=',
    '~': '\\~',
  }

  return value.replace(/,|\.|<|>|\{|\}|\[|\]|"|'|:|;|!|@|#|\$|%|\^|&|\*|\(|\)|-|\+|=|~/g, function (x: string) {
    return replacements[x]
  })
}