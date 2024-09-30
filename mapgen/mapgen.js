import axios from "axios";
import yesno from "yesno";
import AdmZip from "adm-zip";
import yoctoSpinner from "yocto-spinner";
import topojson from "topojson-server";
import * as topojsonClient from "topojson-client";
import { glob } from "glob";
import fs from "fs";
import * as fse from "fs-extra"
import shapefile from "shapefile";
import * as turf from "@turf/turf";
import * as polyclip from "polyclip-ts";
import { geoStitch } from "d3-geo-projection";
import { outputFileSync } from "fs-extra/esm";

import FIPS_CODES from "./fips.json" with {type: "json"};
import CONFIG from "./config.json" with {type: "json"};
import { pruneArcs } from "./mapshaper/topojson-arc-prune.js";
import { presimplify, simplify } from 'topojson-simplify';

const RESOLUTION = 1e3;

const nationalUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/nation-10m.json";
const statesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const countiesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";


// GENERATE GEOJSON FILES
const congressUrl = (input) => {
    return `https://www2.census.gov/geo/tiger/TIGER${CONFIG.year}/CD/tl_${CONFIG.year}_${input}_cd${CONFIG.congress}.zip`;
};
const extractFolder = "maps";

const ok = await yesno({
    question: "Are you sure you want to regenerate all topoJSON files? (y)/n",
    defaultValue: true
});

if(!ok) process.exit();

const generateIndividualCDs = await yesno({
    question: "Do you want to generate individual congressional district files? y/(n)",
    defaultValue: false
});

let spinner;

async function downloadData(){
    /* DOWNLOAD STATES MAP */
    spinner = yoctoSpinner({text: "Downloading national map..."}).start();

    let nationalData = await axios({
        method: "GET",
        url: nationalUrl,
        responseType: "json",
    });
    // Convert to geojson since we are using it for clipping the congressional districts
    let nationMesh = topojsonClient.merge(nationalData.data, [nationalData.data.objects.nation]);


    spinner.success();


    /* DOWNLOAD STATES MAP */
    spinner = yoctoSpinner({text: "Downloading US states map..."}).start();

    let statesData = await axios({
        method: "GET",
        url: statesUrl,
        responseType: "json",
    });
    saveTopo('US', 'states.json', statesData.data);
    spinner.success();



    /* DOWNLOAD COUNTY MAP */
    spinner = yoctoSpinner({text: "Downloading US counties map..."}).start();

    let countiesData = await axios({
        method: "GET",
        url: countiesUrl,
        responseType: "json",
    });
    saveTopo('US', 'counties.json', countiesData.data);

    spinner.success();

    return { 
        states: topojsonClient.feature(statesData.data, statesData.data.objects.states),
        counties: topojsonClient.feature(countiesData.data, countiesData.data.objects.counties),
        nation: turf.feature(nationMesh) }
    
}

const { states: statesData, counties: countiesData, nation: nationMesh} = await downloadData();

await generateStateData(statesData, countiesData, nationMesh);

async function generateStateData(statesData, countiesData, nationMesh){

    for(var statePostal of Object.keys(FIPS_CODES)){

        spinner.start();

        let districtsData = await downloadDistricts(statePostal);

        let districts = createDistricts(statePostal, districtsData, nationMesh);
        let counties = createCounties(statePostal, countiesData);

        createDistrictCountyMaps(statePostal, districts, counties);

        spinner.success();
    }
}




async function downloadDistricts(statePostal){

    spinner.text = `${statePostal} - Downloading congressional districts...`;

    // Download data
    let { data } = await axios({method: "GET", url: congressUrl(FIPS_CODES[statePostal]), responseType: "arraybuffer"});

    // Standardized to the data format provided by census.gov
    let fileName = `tl_${CONFIG.year}_${FIPS_CODES[statePostal]}_cd${CONFIG.congress}`;

    let zip = new AdmZip(data);

    // We only need the .dbf (data) and .shp (shapefile) data to create a topojson
    zip.extractEntryTo((fileName + '.dbf'), extractFolder + "/temp/", false, true);
    zip.extractEntryTo((fileName + '.shp'), extractFolder + "/temp/", false, true);

    return (await shapefile.read(`${extractFolder}/temp/${fileName}.shp`, `${extractFolder}/temp/${fileName}.dbf`));

}




function createCounties(statePostal, countiesData){

    spinner.text = `${statePostal} - Creating county map...`;

    let features = countiesData.features.filter(feature => {
        return feature.id.substr(0, 2) == FIPS_CODES[statePostal];
    });

    let featureCollection = turf.featureCollection(features);

    // Save topology
    let topo = topojson.topology({counties: featureCollection});
    topo = simplify(presimplify(topo), 1e-5);
    saveTopo(statePostal, "counties.json", topo);

    return featureCollection;
}





function createDistricts(statePostal, districtsData, nationMesh){

    spinner.text = `${statePostal} - Creating districts...`

    // Clip each district by the nation mesh to remove water

    function clipToNation(feature){
        let clipped = turf.intersect(turf.featureCollection([feature, nationMesh]));
        clipped.properties = feature.properties;
        return clipped;
    }

    let districtFeatures = districtsData.features.map(clipToNation);



    let featureCollection = turf.featureCollection(districtFeatures.sort((a,b) => a.properties["CD118FP"]-b.properties["CD118FP"] ));

    // Save topology
    let topo = topojson.topology({cds: featureCollection});
    topo = simplify(presimplify(topo), 1e-5);
    saveTopo(statePostal, "cds.json", topo);

    return featureCollection;

}



function createDistrictCountyMaps(statePostal, districts, counties){

    let districtsNum = districts.features.length;

    // Clip each county by the district boundary

    function clipToDistrict(feature, districtFeature){

        let poly1 = turf.multiPolygon(feature.geometry.coordinates);
        let poly2 = turf.multiPolygon(districtFeature.geometry.coordinates);

        let clipped = turf.intersect(turf.featureCollection([poly1, poly2]));

        if(clipped != null) {
            clipped.properties = feature.properties

            clipped.id = feature.id;
        }
        
        return clipped;
    }

    let layers = {};
    let countyMaps = districts.features.map((district, distIdx) => {

        let featureCollection = turf.featureCollection(counties.features.flatMap((county, ctyIdx) => {

            spinner.text = `${statePostal} - Creating district county maps... ${distIdx+1}/${districtsNum}${'.'.repeat(ctyIdx+1)}`

            let clipped = clipToDistrict(county, district);

            return clipped != null ? clipped : [];

        }));

        layers[`cd-${distIdx+1}`] = featureCollection;
        return featureCollection;

    });

    let topo = topojson.topology(layers);
    topo = simplify(presimplify(topo), 1e-5);
    saveTopo(statePostal, `cds-counties.json`, topo);

    return countyMaps;
}



function saveTopo(statePostal, fileName, data){
    let path = `${extractFolder}/${statePostal}/${fileName}`;
    outputFileSync(path, bufferJson(data));
}

function bufferJson(json){ return Buffer.from(JSON.stringify(json)) };