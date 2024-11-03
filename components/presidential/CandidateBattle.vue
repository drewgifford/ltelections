<script setup lang="ts">

import { getTopTwoCandidates } from '~/server/utils/Util';
import { getBlendedColor } from '~/server/utils/Util';
import type {Race, Candidate} from "~/server/types/ViewModel";
import OfficeType from "~/server/types/enum/OfficeType";

const defaultImage = "/img/generic-candidate.png"

const props = defineProps<{
  race: Race
}>();

const isPresidentialOverview = props.race.state.stateID == '0' && props.race.officeID == OfficeType.President;
const voteTotal = computed(() => {
  return props.race.candidates.reduce((prev, cand) => prev + (props.race.results[cand.polID].vote || 0), 0);
});

const getVotes = (candidate: Candidate) => {
  return props.race.results[candidate.polID].vote;
}

const getElectoralVotes = (candidate: any) => {

  let sum = 0;
  for(let r of Object.values(props.race.reportingUnits) as any){

    if(!r.call) continue;
    if(r.call.winner && r.call.winner == candidate.polID){
      sum += r.electTotal;
    }
  }
  return sum;

}

const tt = computed(() => {

  let topTwo = getTopTwoCandidates(props.race) as Candidate[];

  let color1 = topTwo[0].party.colors[0];
  let color2 = topTwo[1] ? topTwo[1].party.colors[0] : color1;
  const results = props.race.results;

  let percentHalfway = 1;

  if(topTwo[0] && topTwo[1]){

    let votes1 = results[topTwo[0].polID].vote;
    let votes2 = results[topTwo[1].polID].vote

    let margin = (votes1)/(props.race.totalVotes) - (votes2)/(props.race.totalVotes);
    percentHalfway = ((votes1)/props.race.totalVotes + margin/2);

  }

  let backgroundGradient =  `linear-gradient(to right, ${color1}40 ${(percentHalfway-0.5)*100}%, ${color2}40 ${(percentHalfway+0.5)*100}%)`;

  return {
    topTwo: topTwo as Candidate[],
    backgroundGradient: backgroundGradient
  }
})



</script>

<template>
  
  <div class="min-h-10 w-full flex justify-between rounded-tl-sm rounded-tr-sm" v-if="(props.race)" :style="{backgroundImage: tt.backgroundGradient}">
            
      <div class="sm:flex justify-between w-full">

        <!-- Candidate 1 -->
        <div class="flex justify-start space-x-1 text-left gap-2 ">
          <div class="self-end relative h-full flex" :style="{backgroundColor: tt.topTwo[0].party.colors[0]+'40'}">

            <NuxtImg
              :src="tt.topTwo[0].imageURL"
              width="125"
              height="150"
              alt=""
              class="sm:-mt-8 self-end aspect-square object-cover object-top"
            />
          </div>

          <div class="py-2 self-center">
              <p class="text-slate-200">{{ tt.topTwo[0].fullName }}</p>

              <h1 v-if="isPresidentialOverview" class="text-4xl">{{ getElectoralVotes(tt.topTwo[0])}}</h1>
              <h1 :class="isPresidentialOverview ? ['text-xl'] : ['text-3xl']">{{ (((getVotes(tt.topTwo[0]))/(voteTotal > 0 ? voteTotal : 1))*100).toFixed(2)}}%</h1>
              <p class="text-md text-slate-200/75">{{ (getVotes(tt.topTwo[0])).toLocaleString() }}</p>
            </div>
        </div>


        <div class="py-2 self-end text-center text-slate-200 hidden lg:block">

          <p v-if="isPresidentialOverview" class="text-md">Electoral Votes</p>
          <p class="text-md mt-2.5">Percent</p>
          <p class="text-md">Total Votes</p>

        </div>

        <!-- Candidate 2 -->
        <div class="flex space-x-1 sm:text-right gap-2 flex-row-reverse sm:flex-row justify-end sm:justify-end" v-if="(tt.topTwo.length > 1 && tt.topTwo[1] != null)">

          <div class="py-2 self-center">
              <p class="text-slate-200">{{ tt.topTwo[1].fullName }}</p>

              <h1 v-if="isPresidentialOverview" class="text-4xl">{{ getElectoralVotes(tt.topTwo[1]) }}</h1>
              <h1 :class="isPresidentialOverview ? ['text-xl'] : ['text-3xl']">{{((getVotes(tt.topTwo[1])/(voteTotal > 0 ? voteTotal : 1))*100).toFixed(2)}}%</h1>



              <p class="text-md text-slate-200/75">{{ (getVotes(tt.topTwo[1])).toLocaleString() }}</p>
            </div>

          <div class="self-end flex h-full" :style="{backgroundColor: tt.topTwo[1].party.colors[0]+'40'}">

            <NuxtImg
              :src="tt.topTwo[1].imageURL"
              width="125"
              height="150"
              alt=""
              class="sm:-mt-8 self-end aspect-square object-cover object-top"
            />

          </div>
          
        </div>

      </div>


  </div>

  <div class="bg-slate-800 overflow-hidden h-2 relative">

    <div class="block h-2 absolute left-0" :style="{width: `${100*(getVotes(tt.topTwo[0]))/(voteTotal > 0 ? voteTotal : 1)}%`, backgroundColor: tt.topTwo[0].party.colors[0]}"></div>
    <div v-if="(tt.topTwo.length > 1)" class="block h-2 absolute right-0" :style="{width: `${100*(getVotes(tt.topTwo[1]))/(voteTotal > 0 ? voteTotal : 1)}%`, backgroundColor: tt.topTwo[1].party.colors[0]}"></div>

  </div>


</template>

<style>

</style>