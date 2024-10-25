<script setup lang="ts">
import type Candidate from '~/server/types/Candidate';
import type Race from '~/server/types/Race';
import type { ReportingCandidate } from '~/server/types/ReportingUnit';
import type { Raw } from '~/server/utils/Raw';
import { getTopTwoCandidates } from '~/server/utils/Util';

const defaultImage = "/img/generic-candidate.png"

const props = defineProps<{
  race: Race
}>();

let voteTotal = props.race ? (props.race.parameters.vote?.total || 0) : 0

let winner = props.race.candidates.find(cand => cand.winner == "X") as ReportingCandidate;

let backgroundGradient = `linear-gradient(to right, ${(winner.partyData?.colors[0] || '#ffffff')+'80'} 0%, transparent 100%)`

</script>

<template>
  
  <div class="min-h-10 w-full flex justify-between rounded-tl-sm rounded-tr-sm" v-if="(race)" :style="{background: backgroundGradient}">
            
      <div class="flex justify-between w-full">

        <!-- Candidate 1 -->
        <div class="flex justify-start space-x-1 text-left gap-2">
          <div class="self-end">

            <NuxtImg
              :src="winner.imageURL"
              width="125"
              height="150"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />
          </div>

          <div class="py-4 self-center">
              <p class="text-slate-200">{{ winner.fullName }}</p>
              <h1 class="text-3xl">Projected Winner ✓</h1>
              <p>Called at 11/05/2024 11:05PM EST</p>
            </div>
        </div>

      </div>


  </div>

  <div class="bg-slate-800 overflow-hidden h-2 relative">

    <div class="block h-2 absolute left-0" :style="{width: '100%', backgroundColor: (winner.partyData?.colors[0]) }"></div>
  </div>


</template>

<style>

</style>