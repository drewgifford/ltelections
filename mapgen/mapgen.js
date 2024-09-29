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

import FIPS_CODES from "./fips.json" with {type: "json"};
import CONFIG from "./config.json" with {type: "json"};

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


/* DOWNLOAD STATES MAP */
let spinner = yoctoSpinner({text: "Downloading national map..."}).start();

const nationalData = await axios({
    method: "GET",
    url: nationalUrl,
    responseType: "json",
});
// Convert to geojson since we are using it for clipping the congressional districts
let nationMesh = topojsonClient.merge(nationalData.data, [nationalData.data.objects.nation]);


spinner.success();


/* DOWNLOAD STATES MAP */
spinner = yoctoSpinner({text: "Downloading US states map..."}).start();

const statesData = await axios({
    method: "GET",
    url: statesUrl,
    responseType: "json",
});
fse.outputFile(extractFolder + `/US/states.json`, Buffer.from(JSON.stringify(statesData.data)));
spinner.success();

/* DOWNLOAD COUNTY MAP */
spinner = yoctoSpinner({text: "Downloading US counties map..."}).start();

const countiesData = await axios({
    method: "GET",
    url: countiesUrl,
    responseType: "json",
});
fse.outputFile(extractFolder + `/US/counties.json`, Buffer.from(JSON.stringify(countiesData.data)));

// Convert to geojson since we are using it for to make individual state county maps



spinner.success();


let spinnerText = "Making congressional and state maps...";
spinner = yoctoSpinner({text: spinnerText}).start();

generateMaps().then(() => {
    fse.remove(extractFolder + "/temp");

    spinner.success();
});

async function generateMaps(){

    let congressionalDistricts = [];

    var index = 1;
    for(var key of Object.keys(FIPS_CODES)){

        fse.remove(extractFolder + "/" + key);

        spinner.text = `${spinnerText} (${index}/${Object.keys(FIPS_CODES).length}) ${key} - Downloading...`;

        const { data } = await axios({
            method: "GET",
            url: congressUrl(FIPS_CODES[key]),
            responseType: "arraybuffer",
        });

        spinner.text = `${spinnerText} (${index}/${Object.keys(FIPS_CODES).length}) ${key} - Extracting...`;

        const zip = new AdmZip(data);
        const FILE_NAME = `tl_${CONFIG.year}_${FIPS_CODES[key]}_cd${CONFIG.congress}`;

        zip.extractEntryTo((FILE_NAME + ".shp"), extractFolder + "/temp/", false, true);
        zip.extractEntryTo((FILE_NAME + ".dbf"), extractFolder + "/temp/", false, true);



        spinner.text = `${spinnerText} (${index}/${Object.keys(FIPS_CODES).length}) ${key} - Converting to topoJSON...`;

        /* Create geojson */
        let cdGeojson = await shapefile.read(`${extractFolder}/temp/${FILE_NAME}.shp`, `${extractFolder}/temp/${FILE_NAME}.dbf`);

        cdGeojson.features = cdGeojson.features.map(feature => {

            let f = turf.intersect(turf.featureCollection([feature, turf.feature(nationMesh)]));
            feature.geometry = f.geometry;
            feature.properties.fips = feature.id;
            return feature;

        });

        let cdCollection = turf.featureCollection(cdGeojson.features)
        let cdJson = topojson.topology({cds: cdCollection});
        
        fse.outputFile(extractFolder + `/${key}/cds.json`, Buffer.from(JSON.stringify(cdJson)));


        /* Get individual state county map */
        spinner.text = `${spinnerText} (${index}/${Object.keys(FIPS_CODES).length}) ${key} - Extracting counties...`;

        let countyGeojson = topojsonClient.feature(countiesData.data, countiesData.data.objects.counties);
        countyGeojson.features = countyGeojson.features.filter(feature => {
            return feature.id.substr(0, 2) == FIPS_CODES[key];
        });

        let countiesCollection = turf.featureCollection(countyGeojson.features);
        let countiesJson = topojson.topology({counties: countiesCollection});
        fse.outputFile(extractFolder + `/${key}/counties.json`, Buffer.from(JSON.stringify(countiesJson)));

        index++;

        congressionalDistricts = [...congressionalDistricts, ...cdCollection.features];

        if(!generateIndividualCDs) continue;

        let objects = cdCollection.features;

        let cdIndex = 1;

        for(var x in objects){

            let feature = objects[x];
            let features = [];

            // Clip counties map by intersection
            [...countyGeojson.features].forEach((countyFeature, countyIndex) => {

                spinner.text = `${spinnerText} (${index}/${Object.keys(FIPS_CODES).length}) ${key} - Generating CDs... (${cdIndex}/${objects.length})${'.'.repeat(countyIndex+1)}`;

                let poly1 = turf.multiPolygon(countyFeature.geometry.coordinates);
                let poly2 = turf.multiPolygon(feature.geometry.coordinates);

                

                let coords = turf.multiPolygon(polyclip.intersection(poly1.geometry.coordinates, poly2.geometry.coordinates));
                
                if(coords == null) return;

                coords.id = countyFeature.id;
                coords.properties = countyFeature.properties;

                if(coords.geometry.coordinates.length > 0) features.push(coords);

            });

            let cd = turf.featureCollection(features);
            let individualJson = topojson.topology({counties: cd}, 1e4);

            

            let cdNumber = String(feature.properties["CD118FP"]) | "unknown";

            fse.outputFile(extractFolder + `/${key}/cd-${cdNumber}.json`, Buffer.from(JSON.stringify(individualJson)));

            cdIndex++;

            
        }

    }

    // Generate congressional district map
    let fullCongressionalMap = turf.featureCollection(congressionalDistricts);
    let fullCongressJson = topojson.topology({cds: fullCongressionalMap});

    fse.outputFile(extractFolder + `/US/cds.json`, Buffer.from(JSON.stringify(fullCongressJson)));
}

