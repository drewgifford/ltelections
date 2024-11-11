<script setup lang="ts">

import { getTopTwoCandidates } from '~/server/utils/Util';
import { getBlendedColor } from '~/server/utils/Util';
import type {Race, Candidate} from "~/server/types/ViewModel";
import OfficeType from "~/server/types/enum/OfficeType";
import type {ApiHomeDashboard} from "~/server/api/homeDashboard";


const props = defineProps<{
  gopNumber: number,
  demNumber: number,
  needed: number,
  label: string,
}>();

</script>

<template>
  
  <div class="min-h-10 w-full flex justify-between rounded-tl-sm rounded-tr-sm bg-gradient-to-r from-lte-blue/25 to-lte-red/25">
            
      <div class="sm:flex justify-between w-full">

        <!-- Candidate 1 -->
        <div class="flex justify-start space-x-1 text-left gap-2 ">
          <div class="self-end relative h-full flex bg-lte-blue/50">

            <NuxtImg
              src="/img/democrat.png"
              width="125"
              height="150"
              alt=""
              class="sm:-mt-8 self-end aspect-square object-contain object-top"
            />
          </div>

          <div class="py-2 self-center">
              <p class="text-slate-200">Democrats</p>

              <h1 class="text-4xl">{{ demNumber }}</h1>
            </div>
        </div>


        <div class="py-2 self-center text-center text-slate-200 hidden lg:block">

          <h1 class="text-2xl">{{ label }}</h1>
          <p class="text-sm">{{ needed }} needed for control</p>

        </div>

        <!-- Candidate 2 -->
        <div class="flex space-x-1 sm:text-right gap-2 flex-row-reverse sm:flex-row justify-end sm:justify-end">

          <div class="py-2 self-center">
              <p class="text-slate-200">Republicans</p>

              <h1 class="text-4xl">{{ gopNumber }}</h1>

            </div>

          <div class="self-end flex h-full bg-lte-red/50 !ml-0">

            <NuxtImg
              src="/img/republican.png"
              width="125"
              height="150"
              alt=""
              class="sm:-mt-8 self-end aspect-square object-contain object-top"
            />

          </div>
          
        </div>

      </div>


  </div>


</template>

<style>

</style>