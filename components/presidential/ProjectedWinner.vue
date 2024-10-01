<script setup lang="ts">
import type Candidate from '~/server/types/Candidate';
import type Race from '~/server/types/Race';
import type { Raw } from '~/server/utils/Raw';
import { getTopTwoCandidates } from '~/server/utils/Util';

const defaultImage = "https://imagedelivery.net/ilUJ6Cy8nNz2i8r1DPuCPg/7d6ef9e9-e998-4839-343c-529df6a61600/public"

const props = defineProps<{
  race: Raw<Race>
}>();

let voteTotal = props.race ? (props.race.parameters.vote?.total || 0) : 0

let winner = props.race.candidates.find(cand => cand.winner == "X") as Raw<Candidate>;

console.log(winner);

let backgroundGradient = `linear-gradient(to right, ${(winner.partyData.colors[0] || '#ffffff')+'80'} 0%, transparent 100%)`

</script>

<template>
  
  <div class="min-h-10 w-full flex justify-between" v-if="(race)" :style="{background: backgroundGradient}">
            
      <div class="flex justify-between w-full">

        <!-- Candidate 1 -->
        <div class="flex justify-start space-x-1 text-left">
          <div class="self-end">

            <NuxtImg
              :src="winner.imageURL || defaultImage"
              width="125"
              height="125"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />
          </div>

          <div class="py-2 self-center">
              <p class="text-slate-200">{{ winner.first + " " + winner.last }}</p>
              <h1 class="text-3xl">Projected Winner ✓</h1>
              <p>Called at 11/05/2024 11:05PM EST</p>
            </div>
        </div>

      </div>


  </div>

  <div class="bg-slate-800 overflow-hidden h-2 relative">

    <div class="block h-2 absolute left-0" :style="{width: `${100*winner.voteCount/(voteTotal > 0 ? voteTotal : 1)}%`, backgroundColor: winner.partyData.colors[0]}"></div>
  </div>


</template>

<style>

</style>