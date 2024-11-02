
<script lang="ts" setup>
import type { Race } from '~/server/types/ViewModel';
import Projectomatic from '../napkin/Projectomatic.vue';
import { getRaceURL } from '~/server/utils/Util';
import { getBlendedColor } from '~/server/utils/Util';

const ROWS = 12;
const COLS = 12;

const getRaceColor = (race: Race) => {

  let colors = race.candidates[0].party.colors as string[];
  if(race.candidates.length == 1) return colors[0];

  let margin = (race.results[race.candidates[0].polID].vote - (race.results[race.candidates[1].polID]).vote)/(race.totalVotes || 1);
  

  margin *= 100;

  if(margin == 0){
    // Use probabilities
    let probability = race.results[race.candidates[0].polID].probability;

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

  let row = Math.floor(idx / COLS) + 1;
  let col = row % 2 == 0 ? (COLS)-(idx - COLS*(row-1)) : 0;

  return {
    "grid-column": col,
    "grid-row": row
  }
  
}

const getDashboardData = (race: Race) => {

  let leadingCand = race.candidates[0];
  let partyLabel = leadingCand.party.partyID || 'Undefined';

  let margin;
  
  if(race.candidates.length == 1) {
    margin = race.totalVotes;
  } else {
    margin = (race.results[race.candidates[0].polID].vote || 0) - (race.results[race.candidates[1].polID].vote || 0);
  }
  
  let marginPct = margin / (race.totalVotes || 1);

  return {
    race: race,
    leadingCand: leadingCand,
    color: getRaceColor(race)+'80',
    partyLabel: partyLabel,
    state: race.state,
    marginPct: marginPct,
    margin: margin,
    seatNum: race.seatNum || 0
  }

}

const raceData = computed(() => {
  function sortInverse(a: any, b: any){
    return -sort(a,b);
  }
  function sort(a: any,b:any){
    
    // The higher the dem probability, the higher the sort
    // The lower the republican probability, the lower the sort

    if(a.race.candidates.length == 1 && a.race.candidates[0].party == 'Dem') return -1;
    if(a.race.candidates.length == 1 && a.race.candidates[0].party == 'GOP') return 1;

    const { dem: aDem, gop: aGOP } = getDemAndGOP(a.race);
    const { dem: bDem, gop: bGOP } = getDemAndGOP(b.race);

    let aMargin = ((aDem?.voteCount || 0) - (aGOP?.voteCount || 0)) / (a.race.parameters.vote?.total || 1);
    let bMargin = ((bDem?.voteCount || 0) - (bGOP?.voteCount || 0)) / (b.race.parameters.vote?.total || 1);

    if(aMargin > bMargin) return -1;
    if(aMargin < bMargin) return 1;

    if(aDem && bDem && (aDem.probability > bDem.probability)) return -1;
    if(aDem && bDem && (aDem.probability < bDem.probability)) return 1;

    if(aGOP && bGOP && (aGOP.probability > bGOP.probability)) return 1;
    if(aGOP && bGOP && (aGOP.probability < bGOP.probability)) return -1;

    return 0;
  }

  let demRaces = props.races.filter(x => !x.keyRace && x.candidates.reduce(
    (prev: ReportingCandidate, curr: ReportingCandidate) => (curr && curr.probability > prev.probability ? curr : prev)
    ).party == 'Dem'
  ).map(x => getDashboardData(x)).sort(sort);

  let keyRaces = props.races.filter(x => x.keyRace).map(x => getDashboardData(x)).sort(sort);

  let gopRaces = props.races.filter(x => x && x.candidates.reduce(
    (prev: ReportingCandidate, curr: ReportingCandidate) => (prev && prev.probability > curr.probability ? prev : curr)
    ).party == 'GOP'
  ).map(x => getDashboardData(x)).sort(sort);

  return {
    demRaces: demRaces,
    keyRaces: keyRaces,
    gopRaces: gopRaces
  }
});


const props = defineProps<{
  races: Race[]
}>();



</script>

<template>
  <div class="">

    <h1 class="text-2xl text-center mb-3">U.S. House Overview</h1>

    <p>The House Projectomatic is not yet available. Check back soon!</p>
    <!--<Projectomatic :forceSmall="false" :race="(races[0])"/>-->

    <div class="grid grid-cols-2 mt-4 gap-2">
      <div class="bg-lte-blue text-center rounded-sm">
        <h1 class="text-xl">Democrats</h1>
        <h1 class="text-2xl">{{ races.filter(x => x.raceCallStatus == RaceCallStatus.Called && (x.candidates.find(c => c.winner == 'X'))?.party != 'GOP').length }}</h1>
      </div>

      <div class="bg-lte-red text-center rounded-sm">
        <h1 class="text-xl">Republicans</h1>
        <h1 class="text-2xl">{{ races.filter(x => x.raceCallStatus == RaceCallStatus.Called && (x.candidates.find(c => c.winner == 'X'))?.party == 'GOP').length }}</h1>
      </div>
    </div>
    <div class="grid mt-2 gap-2 grid-flow-row grid-cols-3">
      <a v-for="(race, index) of raceData.keyRaces" :href="getRaceURL('2024', race.race)" :id="(`senate-${index}`)" class="senate-race relative px-2 py-1 rounded-sm border-2 border-transparent hover:cursor-pointer hover:brightness-150" :style="{backgroundColor: race.color}">
        <div>
          <p class="text-xs text-white/60">{{ race.state.name }}-{{ race.seatNum }}</p>
          <h1 class="text-sm">{{ race.leadingCand.last }}+{{ (race.marginPct*100).toFixed(2) }}%</h1>

          <div v-if="true" class="flex gap-2 items-center">

            <div class="bg-slate-700 w-full h-1">
                <div class="h-full bg-slate-200" :style="{'width': race.race.eevp + '%'}"></div>
            </div>

            <p class="text-xs text-nowrap text-white/60">{{race.race.eevp.toFixed(0)}}% reporting</p>
          </div>
        </div>
      </a>
    </div>


  </div>
</template>


<style scoped>

  .house-races{

    display: grid;
    grid-template-columns: repeat(40, 1fr);
    width: 100%;

    
  }



</style>