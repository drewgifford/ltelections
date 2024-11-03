
<script lang="ts" setup>
import { e } from 'mathjs';
import Projectomatic from '../napkin/Projectomatic.vue';
import { getRaceURL } from '~/server/utils/Util';
import { getBlendedColor } from '~/server/utils/Util';
import type {Race} from "~/server/types/ViewModel";
import RaceCallStatus from "../../server/types/enum/race/RaceCallStatus";
import { getVotes, getProbability } from "~/server/utils/Util";

const ROWS = 12;
const COLS = 3;

const DEM_BASELINE = 28;
const GOP_BASELINE = 38;

const getRaceColor = (race: Race) => {

  let margin = (getVotes(race, race.candidates[0]) - (getVotes(race, race.candidates[1])))/(race.totalVotes || 1);
  let colors = race.candidates[0]?.party.colors as string[];

  margin *= 50;

  if(margin == 0){
    // Use probabilities
    let probability = getProbability(race, race.candidates[0]);

    if(probability > 0.95){
      return colors[0]
    }
    else if (probability > 0.8){
      return colors[1];
    }
    else if (probability > 0.6){
      return colors[2];
    } else {
      return colors[3];
    }
  }

  if(margin >= 15){
    return colors[0];
  }
  else if (margin >= 7.5){
    return colors[1]
  }
  else if (margin >= 2){
    return colors[2];
  }
  else {
    return colors[3];
  }


}

function getDemAndGOP(race: Race){

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

const getGridPosition = (idx: number) => {

  let row = Math.floor(idx / 3) + 1;
  let col = row % 2 == 0 ? 3-(idx - COLS*(row-1)) : 0;

  return {
    "grid-column": col,
    "grid-row": row
  }
  
}

const getMaxIDX = () => {
  return raceData.value.length-1;
}

const getIDXForControl = () => {
  return getMaxIDX()-13;
}

const getArrowGradient = (idx: number) => {

  const MAX_IDX = getMaxIDX();

  const COLOR2 = "#0041E9";
  const COLOR1 = "#E7004A";

  let min = (idx-2)/MAX_IDX;
  let max = (idx+2)/MAX_IDX;

  let color1 = getBlendedColor(COLOR1, COLOR2, (min < 0 ? 0 : min));
  let color2 = getBlendedColor(COLOR1, COLOR2, (max > 1 ? 1 : max));

  return {
    backgroundImage: `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`
  }
}

const getDashboardData = (race: Race) => {

  let leadingCand = race.candidates[0];
  let partyLabel = leadingCand.party.partyID || 'Undefined';

  let margin = getVotes(race, race.candidates[0]) - getVotes(race, race.candidates[1]);
  let marginPct = margin / (race.totalVotes || 1);

  return {
    race: race,
    leadingCand: leadingCand,
    color: getRaceColor(race)+'80',
    partyLabel: partyLabel,
    state: race.state,
    marginPct: marginPct/2,
    margin: margin,
  }

}

const raceData = computed(() => {
  return props.races.filter(x => !(x.state?.postalCode == 'CA' && x.raceType?.includes("Special"))).map(x => getDashboardData(x)).sort((a: any, b: any) => {

    // The higher the dem probability, the higher the sort
    // The lower the republican probability, the lower the sort

    if(a.race.candidates.length == 1 && a.race.candidates[0].party == 'Dem') return -1;
    if(a.race.candidates.length == 1 && a.race.candidates[0].party == 'GOP') return 1;

    const { dem: aDem, gop: aGOP } = getDemAndGOP(a.race);
    const { dem: bDem, gop: bGOP } = getDemAndGOP(b.race);



    let aResult = a.race.results;
    let bResult = b.race.results;

    if(aDem && aGOP && bDem && bGOP) {
      let aMargin = (aResult[aDem.polID].vote - aResult[aGOP.polID].vote) / a.race.totalVotes;
      let bMargin = (bResult[bDem.polID].vote - bResult[bGOP.polID].vote) / b.race.totalVotes;

      if(aMargin > bMargin) return -1;
      if(aMargin < bMargin) return 1;
    }

    if(aDem && bDem) {
      if (aDem && bDem && (aResult[aDem.polID].probability > bResult[bDem.polID].probability)) return -1;
      if (aDem && bDem && (aResult[aDem.polID].probability < bResult[bDem.polID].probability)) return 1;
    }

    if(aGOP && bGOP) {
      if (aGOP && bGOP && (aResult[aGOP.polID].probability > bResult[bGOP.polID].probability)) return 1;
      if (aGOP && bGOP && (aResult[aGOP.polID].probability < bResult[bGOP.polID].probability)) return -1;
    }

    if(aDem) return -1;
    if(aGOP) return 1;

    return 0;
  });
});


const props = defineProps<{
  races: Race[]
}>();



</script>

<template>
  <div class="">

    <h1 class="text-2xl text-center mb-3">U.S. Senate Overview</h1>

    <p>The Senate Projectomatic is not yet available. Check back soon!</p>
    <!--<Projectomatic :forceSmall="false" :race="(races[0])"/>-->

    <div class="grid grid-cols-2 mt-4 gap-2 px-6">
      <div class="bg-lte-blue text-center rounded-sm">
        <h1 class="text-xl">Democrats</h1>
        <h1 class="text-2xl">{{ DEM_BASELINE + races.filter(x => x.call.status == RaceCallStatus.Called && (x.call.winner?.party.partyID != 'GOP')).length }}</h1>
      </div>

      <div class="bg-lte-red text-center rounded-sm">
        <h1 class="text-xl">Republicans</h1>
        <h1 class="text-2xl">{{ GOP_BASELINE + races.filter(x => x.call.status == RaceCallStatus.Called && (x.call.winner?.party.partyID == 'GOP')).length }}</h1>
      </div>

    </div>

    <div class="mt-2 block lg:grid gap-2 grid-rows-12 grid-cols-3 grid-flow-row px-6">

      <a v-for="(race, index) of raceData" :href="getRaceURL('2024', race.race)" :id="(`senate-${index}`)" class="block mb-2 lg:mb-0 lg:grid senate-race hover:brightness-150 relative px-4 py-1 rounded-sm border-2 border-transparent hover:cursor-pointer" :style="{backgroundColor: raceData[index].color, ...getGridPosition(index)}">
        <div>
          <p class="text-xs text-white/60">{{ raceData[index].state.name }}</p>
          <h1 class="text-sm">{{ raceData[index].leadingCand.last }}+{{ (raceData[index].marginPct*100).toFixed(2) }}%</h1>

          <div v-if="true" class="flex gap-2 items-center">

            <div class="bg-slate-700 w-full h-1">
                <div class="h-full bg-slate-200" :style="{'width': raceData[index].race.eevp + '%'}"></div>
            </div>

            <p class="text-xs text-nowrap text-white/60">{{raceData[index].race.eevp.toFixed(0)}}% reporting</p>
          </div>

          <div v-if="((index+1) % 3 == 0)" class="arrow" :class="((index+1) % 6 == 0 ? 'arrow-left' : 'arrow-right') + ' ' + (index > getIDXForControl() ? 'arrow-flipped' : '')" :style="getArrowGradient(index)">

          </div>
        </div>
      </a>

      

    </div>


  </div>
</template>


<style scoped>

  .arrow{
    content: "";
    height: calc(200% + 1.25rem);
    width: 2rem;
    position: absolute;
    top: 0;
    background-color: red;
    mask-image: url('/img/arrow.svg');
    -webkit-mask-image: url('/img/arrow.svg');
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center right;
    pointer-events: none;

    
  }

  .arrow-right {
    right: 0;
    transform: translateX(calc(100% + 1.5px)) rotate(180deg);
  }
  .arrow-right.arrow-flipped {
    transform: scaleY(-1) translateX(calc(100% + 1.5px)) rotate(180deg);
  }

  .arrow-left {
    left: 0;
    transform: translateX(calc(-100% - 1.5px)) scaleY(-1);
  }
  .arrow-left.arrow-flipped {
    transform: translateX(calc(-100% - 1.5px)) scaleY(1);
  }



</style>