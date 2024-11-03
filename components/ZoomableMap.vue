<script setup lang="ts">

  import { keys } from "~/server/utils/Util";
  import * as d3 from "d3";
  import * as topojson from "topojson-client";
  import LoadingSection from "./LoadingSection.vue";
  import type { Race, RaceReportingUnit } from "~/server/types/ViewModel";
  import OfficeType from "~/server/types/enum/OfficeType";
  import { keyBy } from "~/server/utils/Util";

    const props = defineProps<{
        race: Race,
        minHeight: string,
    }>();

  const INVALID_FILL = "#1E293B";
  const NA_FILL = "#141c30";
  const BG_FILL = "#141c30";
  const BG_STROKE = "#0C1325";

  const reportingUnitsByFIPS = computed(() => {

    if(props.race.state.stateID == '0'){
      return keyBy(Object.values(props.race.reportingUnits), 'reportingunitID')
    }
    return keyBy(Object.values(props.race.reportingUnits), 'fipsCode')
  });

    const getReportingUnit = (d: any) => {
      let reportingUnit;

      if(["AK","DC"].includes(props.race.state?.postalCode as string)){
        reportingUnit = Object.values(props.race.reportingUnits)[0];
        reportingUnit.reportingunitName = props.race.state.name;
      }
      else if (props.race.state.postalCode == 'US'){
        reportingUnit = Object.values(props.race.reportingUnits).find(x => x.state.name == d.properties.name);
      }
      else {

        if(NEW_ENGLAND_STATES.includes(statePostal)){
          reportingUnit = reportingUnitsByFIPS.value[d.properties.COUSUBFP];
        }
        else {
          reportingUnit = reportingUnitsByFIPS.value[d.id as string];
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
      if(race.state.postalCode == 'US' && selectedRu){
        selectedRu.value = race.reportingUnits[selectedRu.value?.state.stateID || ''];
      }
      else if(selectedRu){
        selectedRu.value = race.reportingUnits[selectedRu.value?.reportingunitID || ''];
      }
    }

    async function updateMapColors(race: Race, elements: any){
        elements.attr("fill", (county: any) => {

            let reportingUnit = getReportingUnit(county);

            if(!reportingUnit) return NA_FILL;

            let candidates = keys(reportingUnit.results).sort((a,b) => (reportingUnit.results[a].vote || 0) > (reportingUnit.results[b].vote || 0) ? -1 : 1);

            console.log("candidates:", candidates);
            let raceCand = props.race.candidates.find(cand => cand.polID == candidates[0]);
            console.log(reportingUnit.reportingunitName, raceCand);

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

            if((cand1Vote - cand2Vote) >= ((expectedVoteTotal || 0) - voteTotal)) {
                // If the current number of outstanding votes is greater than the margin between the top two candidates, this county can be solid
                return `${colors[getDifferenceNumber()]}`
            }

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
            keys(race.reportingUnits).forEach(x => {
                countyIds.push(race.reportingUnits[x].fipsCode || '');
            });

            if(!NEW_ENGLAND_STATES.includes(race.state?.postalCode || '')){

                

                obj.geometries = obj.geometries.filter((x: any) => {
                    return countyIds.includes(String(x.id)) || (Object.values(props.race.reportingUnits).find(ru => ru.reportingunitName == x.properties.name));
                });
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
    const loading = ref(true);

    
    

    onMounted(async () => {
    

        let [feature, stateFeature]: any = await populateMap();

        let features: any[] = feature.features;

        let projection = d3.geoAlbersUsa().scale(1).translate([0,0]);

        projection.fitExtent([[20,20],[elem.value?.clientWidth || 100, elem.value?.clientHeight || 200]], feature);



        let geoGenerator: any = d3.geoPath()
            .projection(projection);

        // TEST: add state behind house projection

        if(stateFeature) d3.select(elem.value).select("#background").selectAll('path').data(stateFeature.features).join('path').attr('d', geoGenerator).attr("fill", BG_FILL).attr("stroke", BG_STROKE).attr("stroke-width", 1);
        let defs = d3.select(elem.value).append("defs");
        var svg = d3.select(elem.value).select("#foreground").selectAll('path').data(features).join('path').attr('d', geoGenerator).attr("stroke","#0C1325").attr("stroke-width", 0.75);

        

        let parties: any[] = [];
        
        for(let candidate of props.race.candidates){
            if(parties.includes(candidate.party)) continue;

            parties.push(candidate.party);

            for(let i = 0; i < (candidate.party.colors.length || 0); i++){
                let pattern = defs.append("pattern")
                    .attr('id',`pattern-${candidate.party.partyID}-${i}`).attr('patternUnits', 'userSpaceOnUse').attr("width","8").attr("height","8");

                pattern.append("rect").attr("width","8").attr("height","8").attr("fill", (candidate.party.colors[i] as string)+'70');
                pattern.append("path").attr("d","M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4")
                    .attr("stroke-width", "3")
                    .attr("stroke", (candidate.party.colors[i] as string)+'aa');
            }

            
        }

        watch(() => props.race, async (race) => {
            await updateMapColors(race, svg);
            await updateTooltipData(race);
        });
        await updateMapColors(props.race, svg);

        loading.value = false;

        const mouseover = function(this: any, event: any, d: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;

            // Fill data
            let reportingUnit;

            reportingUnit = getReportingUnit(d);


            
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

            if(x + svgBounds.x + tooltipBounds.width + 20 > window.innerWidth){
                // Clip to left side instead
                xOffset = -20 - tooltipBounds.width;
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

const getTopCandidate = (ru: any) => {
  let topProbabilities =  props.race.candidates.toSorted((a: any,b: any) => Number(ru.results[a.polID].probability) > Number(ru.results[b.polID].probability) ? -1 : 1);

  return topProbabilities[0];

}

</script>

<template>

    <div class="relative">

        <div class="overflow-x-auto rounded-sm absolute top-0 left-0 bg-slate-900/90 px-4 py-2 min-w-80 shadow-lg pointer-events-none !duration-0" style="filter: opacity(0)" ref="tooltip">

            <div v-for="ru in [selectedRu]" v-if="selectedRu" :key="selectedRu?.reportingunitID">

              <div v-if="IS_NATIONAL_MAP()">
                <div class="flex">
                  <div class="flex-1">
                    <p class="text-white text-left font-header mb-2">{{ ru.state.name }}</p>
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

        <svg class="w-full" ref="svg" :style="(loading ? {filter: 'opacity(0)', minHeight: `${props.minHeight}`} : {minHeight: `${props.minHeight}`})">
            <g id="background"></g>
            <g id="foreground"></g>
            
        </svg>

        <LoadingSection v-if="loading" :absolute=true :style="{minHeight: `${props.minHeight}`}"/>
    </div>

    
                        
</template>