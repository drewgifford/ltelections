<script setup lang="ts">
import {getCallText, getTopTwoCandidates, parseDateString} from '~/server/utils/Util';
import type {Candidate, Race} from "~/server/types/ViewModel";
import moment from "moment-timezone";

const defaultImage = "/img/generic-candidate.png"

const props = defineProps<{
  race: Race
}>();

const winner = computed(() => props.race.candidates.find(x => x.polID == props.race.call.winner as string));

console.log("Race:", props.race);

let backgroundGradient = `linear-gradient(to right, ${(winner.value.party?.colors[0] || '#ffffff')+'80'} 0%, transparent 100%)`

const projectionText = computed(() => getCallText(props.race));

</script>

<template>
  
  <div class="min-h-10 w-full flex justify-between rounded-tl-sm rounded-tr-sm" v-if="(race && winner)" :style="{background: backgroundGradient}">
            
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
              <p>Called by {{ projectionText.caller }} on {{ parseDateString(projectionText.calls[projectionText.caller as string] as string) }}</p>
            </div>
        </div>

      </div>


  </div>

  <div class="bg-slate-800 overflow-hidden h-2 relative">

    <div class="block h-2 absolute left-0" :style="{width: '100%', backgroundColor: (winner.party?.colors[0]) }"></div>
  </div>


</template>

<style>

</style>