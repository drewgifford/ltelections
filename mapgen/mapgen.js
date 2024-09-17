import axios from "axios";
import yesno from "yesno";
import AdmZip from "adm-zip";
import yoctoSpinner from "yocto-spinner";
import topojson from "topojson-server";
import { glob } from "glob";
import fs from "fs";
import path from "path";

const YEAR = "2020"

// GENERATE GEOJSON FILES
const url = "https://github.com/unitedstates/districts/archive/gh-pages.zip"
const extractFolder = "maps"

const ok = await yesno({
    question: "Are you sure you want to regenerate all topoJSON files? (y)/n",
    defaultValue: true
})

/* DOWNLOAD ZIP FILE */
let spinner;

if(ok) {
    let spinner = yoctoSpinner({text: "Downloading shapefile archive..."}).start();

    const { data } = await axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer",
        onDownloadProgress: (progressEvent) => {
            let rate = (progressEvent.rate / 1048576) || 0;
            let size = (progressEvent.loaded / 1048576) || 0;
            spinner.text = `Downloading shapefile archive... ${size.toFixed(2)}MiB (${rate.toFixed(2)}MiB/s)`
        }
    });

    spinner.success();

    /* EXTRACT TO FOLDER */

    spinner = yoctoSpinner({text: "Extracting to folder..."}).start();
    spinner.start();

    const zip = new AdmZip(data);
    await zip.extractAllTo(extractFolder + "/temp", true);

    spinner.success();
}

/* CONVERT TO TOPOJSON */

spinner = yoctoSpinner({text: "Converting files to topoJSON..."}).start();

const geojsonFiles = await glob(extractFolder + "/temp/**/shape.geojson");

var index = 0;

for (const f of geojsonFiles){
    index++;

    let file = fs.readFileSync(f);
    let dir = path.dirname(f)
    let folders = dir.split("/");

    spinner.text = `Converting files to topoJSON... ${folders[folders.length-2]}/${folders[folders.length-1]} (${index}/${geojsonFiles.length})`
    //var topology = topojson.topology(file);

    /* Check if we are in a CD or state */
    
    

    if(folders.includes("cds")){
        // Check year, it'll be the second from last folder

        let year = folders[folders.length - 2];

        if(Number(year) < Number(YEAR)) continue;
        console.log(f);

        
    }

}

spinner.success();