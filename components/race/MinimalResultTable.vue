<script setup lang="ts">
import type {Candidate, PresidentialReportingUnit, Race, RaceReportingUnit} from '~/server/types/ViewModel';
import { notZero, sortCandidates } from '~/server/utils/Util';
import { keys } from '~/server/utils/Util';
import type {ApiHomeDashboard, ApiMinimalRace} from "~/server/api/homeDashboard";


const props = defineProps<{
    race: Race | PresidentialReportingUnit,
    unit: ApiMinimalRace,
    homeDashboard: ApiHomeDashboard,
}>();

const getTotalVotes = (): number => {
  if(keys(props.unit).includes("call")) {
      return notZero(props.unit.totalVotes*2)
  } else return notZero(props.unit.totalVotes);
}

const isWinner = (candidate: Candidate): boolean => {

  if(keys(props.unit).includes("call")){

    let u = props.unit as ApiMinimalRace;

    if(u.winner as string == candidate.polID) return true;
    return false;
  }
  if(props.race.call.winner?.polID == candidate.polID){
    return true;
  }
  return false;


}

</script>

<template>

    <div class="flex w-full"  v-for="candidate of unit.candidates.map(x => {
      return race.candidates.find(y => y.polID == x.polID);
      }
    )" :key="candidate.polID">
        <div v-if="isWinner(candidate)" :style="[{backgroundColor: candidate.party?.colors[0]}]" class="rounded-l-sm text-xs px-1 w-4 flex items-center font-header text-center">✓</div>

        <div :style="[{backgroundColor: candidate.party?.colors[0]+'40'}]" class="flex flex-1 px-2 py-1 justify-between items-center rounded-r-sm">
            <p class="text-sm text-slate-200">{{ candidate.last }}<span v-if="(race.incumbents.find(x => x.polID == candidate.polID))">*</span> <span class="text-slate-400 text-xs ml-1/2">{{ candidate.party?.partyID || 'Ind' }}</span></p>

            <div class="text-right">
                <p class="text-sm text-slate-200"><span class="text-xs text-slate-200/50">{{ (Object.values(unit.candidates).find(x => x.polID == candidate.polID)?.vote).toLocaleString() }}</span>&nbsp;{{ (((Object.values(unit.candidates).find(x => x.polID == candidate.polID)?.vote) / getTotalVotes() as number)*100).toFixed(2) }}%</p>
            </div>
        </div>
    </div>

    <div class="flex gap-2 items-center mt-2">

        <div class="bg-slate-700 w-full h-1">
            <div class="h-full bg-slate-200" :style="{'width': unit.eevp + '%'}"></div>
        </div>

        <p class="text-xs text-nowrap">{{unit.eevp}}% reporting</p>
    </div>

</template>