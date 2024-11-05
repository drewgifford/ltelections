<script setup lang="ts">
import type {Candidate, PresidentialReportingUnit, Race, RaceReportingUnit} from '~/server/types/ViewModel';
import { notZero, sortCandidates } from '~/server/utils/Util';
import { keys } from '~/server/utils/Util';
import type {ApiHomeDashboard, ApiMinimalRace} from "~/server/api/homeDashboard";
import type {ApiParty} from "~/server/types/ApiTypes";


const props = defineProps<{
    race: ApiMinimalRace,
    homeDashboard: ApiHomeDashboard,
}>();

const getTotalVotes = (): number => {
  if(props.race.winner) {
      return notZero(props.race.totalVotes)
  } else return notZero(props.race.totalVotes);
}

const isWinner = (candidate: {
  last: string,
  party: string,
  probability: number,
  vote: number,
  polID: string,
}): boolean => {

  return (props.race.winner == candidate.polID)
}

const getParty = (candidate: {
  last: string,
  party: string,
  probability: number,
  vote: number,
  polID: string,
}): ApiParty => {
  return props.homeDashboard.parties[candidate.party];
}

</script>

<template>

    <div class="flex w-full"  v-for="candidate of race.candidates" :key="candidate.polID">
        <div v-if="isWinner(candidate)" :style="[{backgroundColor: getParty(candidate)?.colors[0]}]" class="rounded-l-sm text-xs px-1 w-4 flex items-center font-header text-center">✓</div>

        <div :style="[{backgroundColor: getParty(candidate)?.colors[0]+'40'}]" class="flex flex-1 px-2 py-1 justify-between items-center rounded-r-sm">
            <p class="text-sm text-slate-200">{{ candidate.last }}<span v-if="(candidate.incumbent)">*</span> <span class="text-slate-400 text-xs ml-1/2">{{ getParty(candidate)?.partyID || 'Ind' }}</span></p>

            <div class="text-right">
                <p class="text-sm text-slate-200"><span class="text-xs text-slate-200/50">{{ candidate.vote.toLocaleString() }}</span>&nbsp;{{ (((candidate.vote / getTotalVotes() as number)*100).toFixed(2)) }}%</p>
            </div>
        </div>
    </div>

    <div class="flex gap-2 items-center mt-2">

        <div class="bg-slate-700 w-full h-1">
            <div class="h-full bg-slate-200" :style="{'width': race.eevp + '%'}"></div>
        </div>

        <p class="text-xs text-nowrap">{{race.eevp}}% reporting</p>
    </div>

</template>