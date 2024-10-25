import csv from "csvtojson";

type CountyData = {

    year: number,
    state: string,
    state_po: string,
    county_name: string,
    county_fips: string,

    candidate: string,
    party: string,
    totalvotes: number,
    candidatevotes: number
}

export type HistoricalCounty = {
    swing: number,
    dem: number,
    demPct: number,
    rep: number,
    repPct: number,
    margin: number,
    totalvotes: number,

    county_name: string,
    county_fips: string,
    state: string,
    state_po: string
}

export async function parseHistoricalData(){

    let d: CountyData[] = await csv().fromFile("./assets/csv/countypres_2000-2020.csv");

    let parsedCounties: HistoricalCounty[] = [];

    let weights: { [key: number]: number } = {
        2012: 1,
        2016: 2,
        2020: 4,
    }
    let totalWeight = Object.values(weights).reduce((b,a) => b+a, 0);
    let states: string[] = [];

    for(let county of d){

        if(Number(county.year) < 2012) continue;

        if(!states.includes(county.state)) states.push(county.state);

        let existing = parsedCounties.find(x => x.county_fips == county.county_fips);
        let currCounty;

        if(!existing){
            currCounty = {
                dem: 0,
                demPct: 0,
                rep: 0,
                repPct: 0,
                swing: 0,
                totalvotes: 0,
                margin: 0,
                county_name: county.county_name,
                county_fips: county.county_fips,
                state: county.state,
                state_po: county.state_po
            } as HistoricalCounty;
        } else currCounty = existing;

        

        let addedVotes = (county.candidatevotes) * weights[county.year];
        if(county.party == "DEMOCRAT"){
            currCounty.dem += addedVotes;
        }
        if(county.party == "REPUBLICAN"){
            currCounty.rep += addedVotes;
        }

        currCounty.totalvotes += addedVotes;

        if(!existing) parsedCounties.push(currCounty);

    }

    parsedCounties.forEach((county) => {
        county.demPct = county.dem / county.totalvotes;
        county.repPct = county.rep / county.totalvotes;
        county.margin = county.repPct - county.demPct;
    });

    states.forEach(state => {

        let counties = parsedCounties.filter(x => x.state == state);

        let dem = counties.reduce((sum, c) => sum + c.dem, 0);
        let rep = counties.reduce((sum, c) => sum + c.rep, 0);
        let totalvotes = counties.reduce((sum, c) => sum + c.totalvotes, 0);

        // County percent
        let demPct = dem / totalvotes;
        let repPct = rep / totalvotes;

        let margin = repPct - demPct;

        counties.forEach(county => {
            county.swing = county.margin - margin;

        });

    });


    return parsedCounties;
}