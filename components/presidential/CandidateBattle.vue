<script setup lang="ts">
import type Candidate from '~/server/types/Candidate';
import type Race from '~/server/types/Race';

const defaultImage = "https://imagedelivery.net/ilUJ6Cy8nNz2i8r1DPuCPg/7d6ef9e9-e998-4839-343c-529df6a61600/public"

const props = defineProps<{
  race: Raw<Race>
}>();

const getTopTwoCandidates = () => {

  let candidates = props.race.candidates;

  if(candidates.length <= 1) return [candidates[0], null];

  let republican = candidates.find(cand => cand.party == "GOP");
  let democrat = candidates.find(cand => cand.party == "Dem");

  // First action - try polling data

  // Second strategy - Check for an incumbent
  let incumbents = props.race.incumbents;

  if(incumbents.length > 0){

    let incumbent = incumbents[0];

    let incumbentData = candidates.find(cand => cand.polID == incumbent.polID);
    let incumbentParty = incumbentData?.party || '';

    // If the incumbent is actually running
    if(incumbentData) {
      // If there is both a democrat and republican in this race, and the incumbent is independent
      if (democrat && republican && !["Dem","GOP"].includes(incumbentParty)) return [incumbentData, republican];

      // If there is a democrat in this race and the incumbent is republican
      else if(democrat && incumbentParty == 'GOP') return [democrat, incumbentData];
      else if(republican && incumbentParty == 'Dem') return [incumbentData, republican]
      else return [incumbentData, candidates.find(cand => cand.polID != incumbent.polID) as Candidate];
    }
  }

  // Third strategy - Pair D and R
  

  if(republican && democrat){
    // Both parties have been found, return both
    return [democrat, republican];
  }


  // Fourth strategy - Alphabetical order
  return [candidates[0], candidates[1]];

}

let voteTotal = props.race ? (props.race.parameters.vote?.total || 0) : 0

const topTwo = getTopTwoCandidates();



</script>

<template>
  
  <div class="min-h-10 w-full flex justify-between" v-if="(race)">
            
      <div class="flex justify-between w-full">

        <!-- Candidate 1 -->
        <div class="flex justify-start space-x-1 text-left">
          <div class="self-end">

            <NuxtImg
              :src="topTwo[0].imageURL || defaultImage"
              width="125"
              height="125"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />
          </div>

          <div class="py-2 self-center">
              <p class="text-slate-200">{{ topTwo[0].first + " " + topTwo[0].last }}</p>
              <h1 class="text-3xl">{{ ((topTwo[0].voteCount/(voteTotal > 0 ? voteTotal : 1))*100).toFixed(2) }}%</h1>
              <p class="text-md text-slate-200/75">{{ topTwo[0].voteCount.toLocaleString() }}</p>
            </div>
        </div>


        <div class="py-2 self-end text-center text-slate-200">

          <p class="text-md">Percent</p>
          <p class="text-md mt-1.5">Total Votes</p>

        </div>

        <!-- Candidate 2 -->
        <div class="flex justify-start space-x-1 text-right" v-if="(topTwo.length > 1 && topTwo[1] != null)">

          <div class="py-2 self-center">
              <p class="text-slate-200">{{ topTwo[1].first + " " + topTwo[1].last }}</p>
              <h1 class="text-3xl">{{((topTwo[1].voteCount/(voteTotal > 0 ? voteTotal : 1))*100).toFixed(2)}}%</h1>
              <p class="text-md text-slate-200/75">{{ topTwo[1].voteCount.toLocaleString() }}</p>
            </div>

          <div class="self-end">

            <NuxtImg
              :src="topTwo[1].imageURL || defaultImage"
              width="125"
              height="125"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />

          </div>
          
        </div>

      </div>


  </div>

  <div class="bg-slate-800 overflow-hidden h-2 relative">

    <div class="block h-2 absolute left-0" :style="{width: '50.5%', backgroundColor: topTwo[0]?.partyData.colors[0]}"></div>
    <div class="block h-2 absolute right-0" :style="{width: '41.5%', backgroundColor: topTwo[1]?.partyData.colors[0]}"></div>

  </div>


</template>

<style>

</style>