<script setup lang="ts">

import {keys, nth} from "~/server/utils/Util";
  import * as d3 from "d3";
  import * as topojson from "topojson-client";
  import LoadingSection from "./LoadingSection.vue";
  import type {Candidate, PresidentialReportingUnit, Race, RaceReportingUnit} from "~/server/types/ViewModel";
  import OfficeType from "~/server/types/enum/OfficeType";
  import { keyBy } from "~/server/utils/Util";
  import { getBlendedColor} from "~/server/utils/Util";
  import type {ApiHomeDashboard, ApiMinimalRace} from "~/server/api/homeDashboard";
  import MinimalResultTable from "~/components/race/MinimalResultTable.vue";
  import { hasKey } from "~/server/utils/Util";
  import States from "~/server/utils/States";


  const props = defineProps<{
        minHeight: string,
        homeDashboard: ApiHomeDashboard,
        type: string,
    }>();

  const races = computed(() => props.type == "senate" ? props.homeDashboard.senateRaces : props.homeDashboard.houseRaces);

  const INVALID_FILL = "#2a384d";
  const NA_FILL = "#1C2533";
  const BG_FILL = "#1C2533";
  const EV_FILL = "#676C79";
  const BG_STROKE = "#0C1325";
  const STROKE_WIDTH = props.type == "senate" ? 0.75 : 0.15;

    const getReportingUnit = (d: any) => {
      if(!d) return null;

      if(!hasKey(races.value, d3.select(d).attr("id"))) return null;
      return races.value[d3.select(d).attr("id")];
    }



    const elem = useTemplateRef("map");
    const tooltip = useTemplateRef("tooltip");



    // Tooltip values
    let selectedRu = ref<ApiMinimalRace>();

    async function updateTooltipData(){
      if(selectedRu){
        selectedRu.value = Object.values(races.value).find(x => x.uuid == selectedRu.value?.uuid);
      }
    }

    async function updateMapColors(elements: any){


      function getColor(reportingUnit: any, forceHashed?: boolean){

        if(!reportingUnit) return BG_FILL;




        let candidates = reportingUnit.candidates.toSorted(
            (a: string,b: string) => {
              let aCand = reportingUnit.candidates.find((x: Candidate) => x.polID == a)?.vote;
              let bCand = reportingUnit.candidates.find((x: Candidate) => x.polID == b)?.vote;

              if(aCand > bCand) return -1;
              if(aCand < bCand) return 1;
              return 0;

            }



        );


        let leadingParty = Object.values(props.homeDashboard.parties).find(party => party.partyID == candidates[0].party);


        let county = Object.keys(races.value).find(x => races.value[x].uuid == reportingUnit.uuid)


        if(!leadingParty) return NA_FILL;



        let defaultColors: string[] = ["#ffffff","#aaaaaa","#999999","#777777"]

        let colors = leadingParty.colors;
        if(!colors || colors.length < 4) colors = defaultColors;




        if(reportingUnit.winner){
          return colors[0];
        }

        let voteTotal = reportingUnit.totalVotes || 0;
        let vt = (voteTotal == 0 ? 1 : voteTotal);



        let cand1Vote = reportingUnit.candidates.find((x: any) => x.party == leadingParty.partyID)?.vote || 0;
        let cand2Vote = reportingUnit.candidates.find((x: any) => x.party != leadingParty.partyID)?.vote || 0;


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

        if(!forceHashed) {
          if ((cand1Vote - cand2Vote) >= ((expectedVoteTotal || 0) - voteTotal)) {
            // If the current number of outstanding votes is greater than the margin between the top two candidates, this county can be solid
            if(difference == 0){
              return getBlendedColor(NA_FILL, '#ffffff', 0.75);
            }
            return `${getBlendedColor(colors[getDifferenceNumber()], NA_FILL, 0.100)}`
          }
        }

        if(difference == 0) return `url(#pattern-tie)`;
        // If the candidate hasn't reached over 50% of the expected vote
        return `url(#pattern-${leadingParty.partyID}-${getDifferenceNumber()})`

      }

      let states = elements.select("#states").selectAll("path");
        states.attr("fill", (d: any, i: any, nodes: any) => {



          let state = nodes[i];


          let reportingUnit = getReportingUnit(state);

          if(!reportingUnit) return NA_FILL;


          return getColor(reportingUnit);


        });
    }

    let ruIdx = 0;
    const loading = ref(true);




    onMounted(async () => {








        // TEST: add state behind house projection


        let xmlDocument;
        if(props.type == 'house'){
          xmlDocument = await d3.xml("/img/house.svg");
        } else {
          xmlDocument = await d3.xml("/img/senate.svg");
        }



        elem.value?.appendChild(xmlDocument.documentElement);
        let svg = d3.select(elem.value).select("svg");

        let defs = svg.append("defs");

        svg.attr("class","w-full");
        loading.value = false;

        svg.selectAll('text').attr("stroke","none");

        svg.selectAll('path')
            .attr("stroke", "#0C1325")
            .attr("stroke-width",STROKE_WIDTH)
            .attr("shape-rendering", "geometricPosition")

        svg.select("#electoralVotes").selectAll('path').attr("pointer-events","none")
        svg.selectAll('text').attr("pointer-events","none")

        //var svg = d3.select(elem.value).select("#foreground").selectAll('path').data(features).attr("stroke","#0C1325").attr("stroke-width", 0.75);

        // STATE LABELS FOR PRES



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

        for(let party of Object.values(props.homeDashboard.parties)){

            parties.push(party);

            for(let i = 0; i < (party.colors.length || 0); i++){

                let color1 = getBlendedColor(NA_FILL, party.colors[i], 0.75);
                let color2 = getBlendedColor(NA_FILL, party.colors[i], 0.5);

                let pattern = defs.append("pattern")
                    .attr('id',`pattern-${party.partyID}-${i}`).attr('patternUnits', 'userSpaceOnUse').attr("width","8").attr("height","8");

                pattern.append("rect").attr("width","8").attr("height","8").attr("fill", color1);
                pattern.append("path").attr("d","M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4")
                    .attr("stroke-width", "3")
                    .attr("stroke", color2);
            }


        }

        watch(() => props.homeDashboard.senateRaces, async (race) => {
            await updateMapColors(svg);
            await updateTooltipData();
        });
        await updateMapColors(svg);



        const mouseover = function(this: any, event: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;

            // Fill data
            let reportingUnit;

            let d = d3.select(this);
            reportingUnit = getReportingUnit(this);

            if(!reportingUnit) return;


            selectedRu.value = reportingUnit || undefined;

            if(selectedRu.value){
                t.style.filter = 'opacity(1)';
            }
            ruIdx++;

            d.attr('stroke', 'white').attr("stroke-width", STROKE_WIDTH*2).raise();

            if(selectedRu.value){

              let state = States.find(x => x.postalCode == d.attr("id").split("-")[0]);


              let k = keys(races.value).find(x => {
                return races.value[x].uuid == selectedRu.value?.uuid;
              }) || "undefined-undefined";

              let apx = "";
              if(selectedRu.value.special){
                apx += "-special";
              }

                if(props.type == 'senate'){
                  d.attr("style", "cursor: pointer").attr("onclick", `window.location.href='/results/2024/${state?.name.toLowerCase()}/senate${apx}'`);
                }
                else {
                  d.attr("style", "cursor: pointer").attr("onclick", `window.location.href='/results/2024/${state?.name.toLowerCase()}/house-${k.split('-')[1]}'`);
                }

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
                d3.select(this).attr('stroke', '#0C1325').attr("stroke-width", STROKE_WIDTH).lower();
            }
        }

        svg.select("#states").selectAll("path")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);



    });



const getStateName = () => {
  if(!selectedRu.value) return null;

  let k = keys(races.value).find(x => {
    return races.value[x].uuid == selectedRu.value?.uuid;
  }) || "undefined-undefined";

  let state = States.find(x => x.postalCode == k.split("-")[0]);

  let name = state.name;

  if(props.type == "house"){

    let num = k.split("-")[1]
    name = name + "'s " + num + nth(num);

  }

  if(selectedRu.value.special) return name + " Special";
  return name;
}

</script>

<template>

    <div class="relative">

        <div class="z-20 overflow-x-auto rounded-sm absolute top-0 left-0 bg-slate-900/90 px-4 py-2 min-w-80 shadow-lg pointer-events-none !duration-0" style="filter: opacity(0)" ref="tooltip">

            <div v-for="ru in [selectedRu]" v-if="selectedRu">

              <div class="flex">
                <div class="flex-1">
                  <p class="text-white text-left font-header mb-2">{{ getStateName() }}</p>
                </div>
              </div>
              <ChamberResultTable :home-dashboard="homeDashboard" :race="ru" :key="ruIdx"/>


            </div>
        </div>

        <div class="w-full" ref="map" :style="(loading ? {filter: 'opacity(0)', minHeight: `${props.minHeight}`} : {minHeight: `${props.minHeight}`})">
        </div>

        <LoadingSection v-if="loading" :absolute=true :style="{minHeight: `${props.minHeight}`}"/>
    </div>



</template>

<style>

svg #text text {
  fill: white !important;
  font-family: "Manrope", "Open Sauce Sans", sans-serif;
  font-weight: bolder;
  @apply text-lg;
}


</style>