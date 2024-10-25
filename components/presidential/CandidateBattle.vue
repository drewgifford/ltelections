<script setup lang="ts">
import type Candidate from '~/server/types/Candidate';
import type Race from '~/server/types/Race';
import type { ReportingCandidate } from '~/server/types/ReportingUnit';
import type { Raw } from '~/server/utils/Raw';
import { getTopTwoCandidates } from '~/server/utils/Util';
import { getBlendedColor } from '~/server/utils/Util';

const defaultImage = "/img/generic-candidate.png"

const props = defineProps<{
  race: Race
}>();

const voteTotal = computed(() => props.race ? (props.race.parameters.vote?.total || 0) : 1);

const tt = computed(() => {

  let topTwo = getTopTwoCandidates(props.race) as ReportingCandidate[];

  let color1 = topTwo[0].partyData?.colors[0];
  let color2 = topTwo[1] ? topTwo[1].partyData?.colors[0] : color1;

  let percentHalfway = 1;

  if(topTwo[0] && topTwo[1]){

    let margin = (topTwo[0].voteCount || 0)/voteTotal - (topTwo[1].voteCount || 0)/voteTotal;
    percentHalfway = ((topTwo[0].voteCount || 0)/voteTotal + margin/2);

  }

  let backgroundGradient =  `linear-gradient(to right, ${color1}40 ${(percentHalfway-0.5)*100}%, ${color2}40 ${(percentHalfway+0.5)*100}%)`;

  return {
    topTwo: topTwo as ReportingCandidate[],
    backgroundGradient: backgroundGradient
  }
})



</script>

<template>
  
  <div class="min-h-10 w-full flex justify-between rounded-tl-sm rounded-tr-sm" v-if="(props.race)" :style="{backgroundImage: tt.backgroundGradient}">
            
      <div class="flex justify-between w-full">

        <!-- Candidate 1 -->
        <div class="flex justify-start space-x-1 text-left gap-2 ">
          <div class="self-end relative h-full flex" :style="{backgroundColor: tt.topTwo[0].partyData?.colors[0]+'40'}">

            <NuxtImg
              :src="tt.topTwo[0].imageURL"
              width="125"
              height="150"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />
          </div>

          <div class="py-2 self-center">
              <p class="text-slate-200">{{ tt.topTwo[0].fullName }}</p>
              <h1 class="text-3xl">{{ (((tt.topTwo[0].voteCount || 0)/(voteTotal > 0 ? voteTotal : 1))*100).toFixed(2) }}%</h1>
              <p class="text-md text-slate-200/75">{{ tt.topTwo[0].voteCount?.toLocaleString() }}</p>
            </div>
        </div>


        <div class="py-8 self-end text-center text-slate-200">

          <p class="text-md">Percent</p>
          <p class="text-md mt-1.5">Total Votes</p>

        </div>

        <!-- Candidate 2 -->
        <div class="flex justify-start space-x-1 text-right gap-2" v-if="(tt.topTwo.length > 1 && tt.topTwo[1] != null)">

          <div class="py-2 self-center">
              <p class="text-slate-200">{{ tt.topTwo[1].fullName }}</p>
              <h1 class="text-3xl">{{(((tt.topTwo[1].voteCount || 0)/(voteTotal > 0 ? voteTotal : 1))*100).toFixed(2)}}%</h1>
              <p class="text-md text-slate-200/75">{{ tt.topTwo[1].voteCount?.toLocaleString() }}</p>
            </div>

          <div class="self-end flex h-full" :style="{backgroundColor: tt.topTwo[1].partyData?.colors[0]+'40'}">

            <NuxtImg
              :src="tt.topTwo[1].imageURL"
              width="125"
              height="150"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />

          </div>
          
        </div>

      </div>


  </div>

  <div class="bg-slate-800 overflow-hidden h-2 relative">

    <div class="block h-2 absolute left-0" :style="{width: `${100*(tt.topTwo[0].voteCount || 0)/(voteTotal > 0 ? voteTotal : 1)}%`, backgroundColor: tt.topTwo[0].partyData?.colors[0]}"></div>
    <div v-if="(tt.topTwo.length > 1)" class="block h-2 absolute right-0" :style="{width: `${100*(tt.topTwo[1].voteCount || 0)/(voteTotal > 0 ? voteTotal : 1)}%`, backgroundColor: tt.topTwo[1].partyData?.colors[0]}"></div>

  </div>


</template>

<style>

</style>