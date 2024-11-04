<script setup lang="ts">

  import { keys } from "~/server/utils/Util";
  import * as d3 from "d3";
  import * as topojson from "topojson-client";
  import LoadingSection from "./LoadingSection.vue";
  import type {PresidentialReportingUnit, Race, RaceReportingUnit} from "~/server/types/ViewModel";
  import OfficeType from "~/server/types/enum/OfficeType";
  import { keyBy } from "~/server/utils/Util";
  import { getBlendedColor} from "~/server/utils/Util";

  const props = defineProps<{
        race: Race,
        minHeight: string,
    }>();

  const INVALID_FILL = "#1E293B";
  const NA_FILL = "#141c30";
  const BG_FILL = "#2a384d";
  const BG_STROKE = "#0C1325";

    const getReportingUnit = (d: any) => {
      if(!d) return null;
      return props.race.reportingUnits[d3.select(d).attr("id")];
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
      if(selectedRu){
        selectedRu.value = Object.values(race.reportingUnits).find(x => x.uuid == selectedRu.value?.uuid);
      }
    }

    async function updateMapColors(race: Race, elements: any){

      function getColor(reportingUnit: any, forceHashed?: boolean){

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



        let difference = ((cand1Vote-cand2Vote)/vt)*100/2;


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
            return `${getBlendedColor(colors[getDifferenceNumber()], NA_FILL, 0.75)}`
          }
        }

        // If the candidate hasn't reached over 50% of the expected vote
        return `url(#pattern-${raceCand.party.partyID}-${getDifferenceNumber()})`

      }

      let votes = elements.select("#electoralVotes").selectAll("path");
      votes.attr("fill", (d: any, i: any, nodes: any) => {

        let state = nodes[i];
        let statePostal = d3.select(state).attr("id").replace("-votes", "");
        let reportingUnit = props.race.reportingUnits[statePostal] as PresidentialReportingUnit;

        if(reportingUnit.totalVotes == 0){
          return BG_FILL;
        }

        if(reportingUnit.call.winner){
          return props.race.candidates.find(x => x.polID == reportingUnit.call.winner as any)?.party.colors[0];
        }
        return getColor(reportingUnit, true);
      });

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



        let xmlDocument = await d3.xml("/img/electoralCollege.svg");


        elem.value?.appendChild(xmlDocument.documentElement);
        let svg = d3.select(elem.value).select("svg");

        let defs = svg.append("defs");

        svg.attr("class","w-full");
        loading.value = false;

        svg.selectAll('text').attr("stroke","none");

        svg.selectAll('path')
            .attr("stroke", "#0C1325")
            .attr("stroke-width",0.75)
            .attr("shape-rendering", "geometricPosition")

        svg.select("#electoralVotes").selectAll('path').attr("pointer-events","none")
        svg.select("#text").selectAll('text').attr("pointer-events","none")

        //var svg = d3.select(elem.value).select("#foreground").selectAll('path').data(features).attr("stroke","#0C1325").attr("stroke-width", 0.75);

        // STATE LABELS FOR PRES





        let parties: any[] = [];
        
        for(let candidate of props.race.candidates){
            if(parties.includes(candidate.party)) continue;

            parties.push(candidate.party);

            for(let i = 0; i < (candidate.party.colors.length || 0); i++){

                let color1 = getBlendedColor(NA_FILL, candidate.party.colors[i], 0.75);
                let color2 = getBlendedColor(NA_FILL, candidate.party.colors[i], 0.5);

                let pattern = defs.append("pattern")
                    .attr('id',`pattern-${candidate.party.partyID}-${i}`).attr('patternUnits', 'userSpaceOnUse').attr("width","8").attr("height","8");

                pattern.append("rect").attr("width","8").attr("height","8").attr("fill", color1);
                pattern.append("path").attr("d","M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4")
                    .attr("stroke-width", "3")
                    .attr("stroke", color2);
            }

            
        }

        watch(() => props.race, async (race) => {
            await updateMapColors(race, svg);
            await updateTooltipData(race);
        });
        await updateMapColors(props.race, svg);



        const mouseover = function(this: any, event: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;

            // Fill data
            let reportingUnit;

            let d = d3.select(this);
            reportingUnit = getReportingUnit(this);

            
            selectedRu.value = reportingUnit || undefined;

            if(selectedRu.value){
                t.style.filter = 'opacity(1)';
            }
            ruIdx++;

            d.attr('stroke', 'white').attr("stroke-width", 1.5).raise();

            if(selectedRu && IS_NATIONAL_MAP()){
                let s = "";
                if((selectedRu.value as any).seatNum > 0) s = '-'+(selectedRu.value as any).seatNum;
                d.attr("style", "cursor: pointer").attr("onclick", `window.location.href='/results/2024/${selectedRu.value?.state?.name.toLowerCase()}/president${s}'`);
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

        svg.select("#states").selectAll("path")
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


        <div class="z-10 overflow-x-auto rounded-sm absolute top-0 left-0 bg-slate-900/90 px-4 py-2 min-w-80 shadow-lg pointer-events-none !duration-0" style="filter: opacity(0)" ref="tooltip">

            <div v-for="ru in [selectedRu]" v-if="selectedRu" :key="selectedRu?.reportingunitID">

              <div v-if="IS_NATIONAL_MAP()">
                <div class="flex">
                  <div class="flex-1">
                    <p class="text-white text-left font-header mb-2">{{ru.state?.name}}<span v-if="ru.seatNum > 0"> CD-{{ru.seatNum}}</span> | {{ ru.electTotal }} EV</p>
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

        <div class="w-full" ref="svg" :style="(loading ? {filter: 'opacity(0)', minHeight: `${props.minHeight}`} : {minHeight: `${props.minHeight}`})">


        </div>

        <LoadingSection v-if="loading" :absolute=true :style="{minHeight: `${props.minHeight}`}"/>

        <MapLegend/>
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