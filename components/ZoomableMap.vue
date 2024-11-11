<script setup lang="ts">

import {getBlendedColor, keys} from "~/server/utils/Util";
  import * as d3 from "d3";
  import * as topojson from "topojson-client";
  import LoadingSection from "./LoadingSection.vue";
import type {Race, RaceReportingUnit, ReportingUnit} from "~/server/types/ViewModel";
  import OfficeType from "~/server/types/enum/OfficeType";
  import { keyBy } from "~/server/utils/Util";

    const props = defineProps<{
        race: Race,
        minHeight: string,
    }>();

const INVALID_FILL = "#2a384d";
const NA_FILL = "#1C2533";
const BG_FILL = "#1C2533";
const EV_FILL = "#676C79";
const BG_STROKE = "#0C1325";

  const { data: reportingUnitData, refresh: refreshRUs } = useFetch(`https://l2bytldico4wuatx.public.blob.vercel-storage.com/reportingUnits/${props.race.state.postalCode}.json`,
      {
        transform: (res) => {
          return res as unknown as {[key: string]: any}
        },
        server: false,
        watch: false,
        immediate: false,
      }
  );

  let loading = ref(true);

  /* GET RESULTS */
  const { data: results, status, refresh } = useFetch("/api/results", {
    query: {
      raceUuid: props.race.uuid
    },
    watch: [props.race],
    transform: async (res: {[key: string]: ReportingUnit & RaceReportingUnit}) => {

      if(!res) return {} as {[key: string]: RaceReportingUnit};

      if(!reportingUnitData || !keys(reportingUnitData.value || {}).includes(props.race.state.stateID)){
        await refreshRUs();
      }

      for(let obj of Object.entries(res)){

        obj[1] = Object.assign(obj[1], (reportingUnitData.value as any)[obj[0]]);
      }



      let r = keyBy(Object.values(res).filter(x => x.reportingunitLevel == 2), 'fipsCode') as {[fips: string]: RaceReportingUnit};

      if(keys(res).includes(props.race.state.stateID)){
        r[props.race.state.stateID] = res[props.race.state.stateID];
      }

      return r;
    },
    server: false,
    lazy: true,
  });


    const getReportingUnit = (d: any) => {
      let reportingUnit;

      if(["AK","DC"].includes(props.race.state?.postalCode as string)){
        reportingUnit = results.value ? results.value[props.race.state.stateID as string] : null
        if(reportingUnit){
          reportingUnit.reportingunitName = props.race.state.name;
        }

      }
      else if (props.race.state.postalCode == 'US'){
        reportingUnit = Object.values(reportingUnitData.value || {}).find(x => x.state.name == d.properties.name);
      }
      else {

        if(NEW_ENGLAND_STATES.includes(statePostal)){
          reportingUnit = results.value ? results.value[d.properties.COUSUBFP] : null;
        }
        else {
          reportingUnit = results.value ? results.value [d.id] : null;
        }

      }
      return reportingUnit;
    }



    const elem = useTemplateRef("svg");
    const tooltip = useTemplateRef("tooltip");

    const NEW_ENGLAND_STATES = ["VT", "CT", "ME", "RI", "NH", "MA"];

    const IS_NATIONAL_MAP =() => {
        return props.race.state.stateID == '0' && props.race.officeID == OfficeType.President
    };



    // Tooltip values
    let selectedRu = ref<RaceReportingUnit>();

    let statePostal = props.race.state?.postalCode;

    async function updateTooltipData(race: Race){
      if(selectedRu.value && results.value){
        selectedRu.value = results.value[selectedRu.value.fipsCode || ''];
      }
    }

    async function updateMapColors(race: Race, elements: any){
        elements.attr("fill", (county: any) => {

            let reportingUnit = getReportingUnit(county);

            if(!reportingUnit) return NA_FILL;

            let candidates = keys(reportingUnit.results).sort((a,b) => (reportingUnit.results[a].vote || 0) > (reportingUnit.results[b].vote || 0) ? -1 : 1);

            let raceCand = props.race.candidates.find(cand => cand.polID == candidates[0]);

            if(!raceCand) return INVALID_FILL;

            let defaultColors: string[] = ["#ffffff","#aaaaaa","#999999","#777777"]

            let colors = raceCand.party.colors;
            if(!colors || colors.length < 4) colors = defaultColors;



            if (candidates.length == 1) return colors[0];

            let voteTotal = reportingUnit.totalVotes || 0;
            let vt = (voteTotal == 0 ? 1 : voteTotal);

            let cand1Vote = reportingUnit.results[candidates[0]].vote;
            let cand2Vote = reportingUnit.results[candidates[1]].vote;

            let difference = ((cand1Vote-cand2Vote)/vt)*100;

            function getDifferenceNumber(){
                if(difference >= 15) { return 0 }
                else if (difference >= 7.5) { return 1 }
                else if (difference >= 2) { return 2 }
                else if (difference > 0) { return 3 }
                else return 3;
            }

            

            let expectedVoteTotal = reportingUnit.expectedVotes;

            if(voteTotal == 0){
                return INVALID_FILL;
            }

            if ((cand1Vote - cand2Vote) >= ((expectedVoteTotal || 0) - voteTotal)) {
              // If the current number of outstanding votes is greater than the margin between the top two candidates, this county can be solid
              if(difference == 0){
                return getBlendedColor(NA_FILL, '#ffffff', 0.75);
              }
              return `${getBlendedColor(colors[getDifferenceNumber()], NA_FILL, 0.75)}`
            }

            if(difference == 0) return `url(#pattern-tie)`;
            // If the candidate hasn't reached over 50% of the expected vote
            return `url(#pattern-${raceCand.party.partyID}-${getDifferenceNumber()})`


        });
    }

    async function populateMap(){

        let race = props.race;
        let officeType = race.officeID;
        

        let data: any;


        if(statePostal == "AK"){

            data = await d3.json(`/maps/${statePostal}/cds.json`);

            return [topojson.feature(data, data.objects.cds), null];
        }

        else if(officeType == OfficeType.President && race.state.stateID == '0'){
            statePostal = 'US';

            data = await d3.json(`/maps/${statePostal}/counties.json`);
            let obj = data.objects[`states`];

            delete data['bbox'];

            return [topojson.feature(data, obj), null];

        }

        else if(officeType == OfficeType.House || (race.seatNum > 0 && officeType == OfficeType.President)){
            // Return congressional district with only the counties included in the reportingUnits

            data = await d3.json(`/maps/${statePostal}/cds-counties.json`);

            let obj = data.objects[`cd-${race.seatNum}`];

            delete data['bbox'];

            let countyIds: string[] = []
            keys(results.value || {}).forEach(x => {

                let fips = results.value && results.value[x] ? results.value[x].fipsCode : null;
                if(fips) countyIds.push(fips);
            });

            if (!NEW_ENGLAND_STATES.includes(race.state?.postalCode || '')){
              /*obj.geometries = obj.geometries.filter((x: any) => {
                return countyIds.includes(String(x.id)) || (keys(results.value || {}).includes(x.id));
              });*/
            }


            // State
            let stateData: any = await d3.json(`/maps/${statePostal}/cds.json`);
            let stateFeature: any = topojson.feature(stateData, stateData.objects.cds);
            
            return [topojson.feature(data, obj), stateFeature];

        } else {

            data = await d3.json(`/maps/${statePostal}/counties.json`);
            data.objects.counties.geometries = data.objects.counties.geometries.filter((x: any) => {
                if (NEW_ENGLAND_STATES.includes(race.state?.postalCode || '')){
                    return Number(x.properties.COUSUBFP) != 0;
                }
                return true;
            });

            return [topojson.feature(data, data.objects.counties), null];

        }

        return data;



    }

    let ruIdx = 0;

    
    

    onMounted(async () => {

        let svg: any = null;
    
        async function updateMap() {
          let [feature, stateFeature]: any = await populateMap();

          let features: any[] = feature.features;

          let projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);

          projection.fitExtent([[20, 20], [elem.value?.clientWidth || 100, elem.value?.clientHeight || 200]], feature);


          let geoGenerator: any = d3.geoPath()
              .projection(projection);

          // TEST: add state behind house projection

          if (stateFeature) d3.select(elem.value).select("#background").selectAll('path').data(stateFeature.features).join('path').attr('d', geoGenerator).attr("fill", BG_FILL).attr("stroke", BG_STROKE).attr("stroke-width", 1);
          let defs = d3.select(elem.value).append("defs");
          svg = d3.select(elem.value).select("#foreground").selectAll('path').data(features).join('path').attr('d', geoGenerator).attr("stroke", "#0C1325").attr("stroke-width", 0.75);


          function addGreyPattern(){
            let color1 = getBlendedColor(NA_FILL, "#ffffff", 0.75);
            let color2 = getBlendedColor(NA_FILL, "#ffffff", 0.5);

            let pattern = defs.append("pattern")
                .attr('id',`pattern-tie`).attr('patternUnits', 'userSpaceOnUse').attr("width","8").attr("height","8");

            pattern.append("rect").attr("width","8").attr("height","8").attr("fill", color1);
            pattern.append("path").attr("d","M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4")
                .attr("stroke-width", "3")
                .attr("stroke", color2);
          }
          addGreyPattern();


          let parties: any[] = [];

          for (let candidate of props.race.candidates) {
            if (parties.includes(candidate.party)) continue;

            parties.push(candidate.party);

            for (let i = 0; i < (candidate.party.colors.length || 0); i++) {

              let color1 = getBlendedColor(NA_FILL, candidate.party.colors[i], 0.75);
              let color2 = getBlendedColor(NA_FILL, candidate.party.colors[i], 0.5);

              let pattern = defs.append("pattern")
                  .attr('id', `pattern-${candidate.party.partyID}-${i}`).attr('patternUnits', 'userSpaceOnUse').attr("width", "8").attr("height", "8");

              pattern.append("rect").attr("width", "8").attr("height", "8").attr("fill", color1);
              pattern.append("path").attr("d", "M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4")
                  .attr("stroke-width", "3")
                  .attr("stroke", color2);
            }
          }
        }
        watch(results, async () => {
            await updateMapColors(props.race, svg);
            await updateTooltipData(props.race);
            loading.value = false;
        });
        await updateMap();
        await updateMapColors(props.race, svg);



        const mouseover = function(this: any, event: any, d: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;

            // Fill data
            let reportingUnit = getReportingUnit(d);
            selectedRu.value = reportingUnit || undefined;

            if(selectedRu.value){
                t.style.filter = 'opacity(1)';
            }
            ruIdx++;
            
            d3.select(this as any).attr('stroke', 'white').attr("stroke-width", 1.5).raise();

            if(selectedRu && IS_NATIONAL_MAP()){
                d3.select(this as any).attr("style", "cursor: pointer").attr("onclick", `window.location.href='/results/2024/${selectedRu.value?.state.name.toLowerCase()}/president'`);
            }
        }

        const mousemove = function(event: any, d: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;
            let x = event.offsetX;
            let y = event.offsetY;

            

            // Fix tooltip if it's clipping outside boundaries

            if(!elem.value) return;

            let svgBounds = elem.value.getBoundingClientRect();
            let tooltipBounds = t.getBoundingClientRect();

            let xOffset = 20;
            let yOffset = 0;

            let rightCheck = x + svgBounds.x + tooltipBounds.width + 20;
            let leftCheck = x + svgBounds.x - tooltipBounds.width - 20

            if(leftCheck < 0 && rightCheck > window.innerWidth){
              xOffset = -tooltipBounds.width/2;
            }
            else if(rightCheck > window.innerWidth){
                // Clip to left side instead
                xOffset = -20 - tooltipBounds.width;
            }
            else if(leftCheck < 0){
              // Clip to left side instead
              xOffset = 20;
            }

            if(y + svgBounds.y + tooltipBounds.height + 40 > window.innerHeight){
                yOffset = -20 - tooltipBounds.height;
            }


            t.style.left = `${x+xOffset}px`;
            t.style.top = `${y+yOffset}px`;

        }

        const mouseleave = function(this: any, d: any){

            if(tooltip.value){
                tooltip.value.style.filter = 'opacity(0)';
                d3.select(this).attr('stroke', '#0C1325').attr("stroke-width", 0.75).lower();
            }
        }

        svg
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        

    });

const tooltipData = computed(() => {

    let candidates = props.race.candidates;
    let highestProb = 0;
    let highestCand = null;

    for(let cand of candidates){
        let probability = props.race.results[cand.polID].probability;

        if(probability > highestProb){
            highestProb = probability;
            highestCand = cand;
        }
    }
    if(highestCand) return highestCand;

});


</script>

<template>

    <div class="relative pb-10">

        <div class="z-20 overflow-x-auto rounded-sm absolute top-0 left-0 bg-slate-900/90 px-4 py-2 min-w-80 shadow-lg pointer-events-none !duration-0" style="filter: opacity(0)" ref="tooltip">

            <div v-for="ru in [selectedRu]" v-if="selectedRu" :key="selectedRu?.reportingunitID">

              <div v-if="IS_NATIONAL_MAP()">
                <div class="flex">
                  <div class="flex-1">
                    <p class="text-white text-left font-header mb-2">{{ ru.state.name }} | {{ ru.electTotal }} EVs</p>
                  </div>
                </div>
                <ResultTable  :key="ruIdx" :race="race" :unit="ru" :max="5" :reporting="true"/>
              </div>
              <div v-else>
                <p class="text-white font-header mb-2">{{ ru.reportingunitName }}</p>

                <ResultTable v-if="!IS_NATIONAL_MAP()"  :key="ruIdx" :race="race" :unit="ru" :max="5" :reporting="true"/>
              </div>


            </div>
        </div>

        <svg class="w-full" ref="svg" :style="{minHeight: `${props.minHeight}`}">
            <g id="background"></g>
            <g id="foreground"></g>
            
        </svg>
        <MapLegend/>



    </div>



    
                        
</template>