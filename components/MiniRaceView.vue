<script lang="ts" setup>
import OfficeType from '~/server/types/enum/OfficeType';
import type { Race } from '~/server/types/ViewModel';
import {getRaceURL, getTopReportingUnit} from "~/server/utils/Util";
import { useWindowSize } from "@vueuse/core";

const props = defineProps<{
    race: Race,
    isPinned: boolean,
  }>();

  const route = useRoute();

  let title = "";
  let desc = "";
  let mounted = true;

  const { width } = useWindowSize();

  const bgColor = computed(() => {

    let officeType = props.race.officeID;

    switch(officeType){
      case OfficeType.President:
        return "#FFD300"
      case OfficeType.Senate:
        return "#0041E9"
      case OfficeType.House:
        return "#94A3B8"
      case OfficeType.Governor:
        return "#00D99E"
      case OfficeType.BallotMeasure:
        return "#ffffff"
      default:
        return "#ffffff"
    }

  })
  
</script>

<template>
  <a class="race relative transition-colors" v-if="mounted" :href="(width < 1280 ? getRaceURL(route.params.date as string, race) : null)">

    <!-- Pin Button -->
    <!--<div @click="$emit('pin')" :class="[isPinned ? 'bg-lte-yellow text-slate-950 hover:brightness-75' : 'bg-slate-900/75 hover:brightness-125']" class="absolute top-0 right-0 h-7 w-7 p-1 rounded-bl-md flex items-center justify-center hover:cursor-pointer ">
        <Icon :name="race ? 'pajamas:thumbtack-solid' : 'pajamas:thumbtack'"/>
    </div>-->

    <div @click="$emit('select')" class="card p-3 pl-6 hover:bg-slate-800 hover:cursor-pointer">
        
        <div class="absolute left-0 top-0 h-full w-2 rounded-l-sm" :style="{backgroundColor: bgColor}"></div>

        

        <div class="md:flex w-full justify-between items-start">
            <div class="flex-1">
                <h4 class="text-lg">
                  <span class="py-1 px-2 text-md mr-1 border-2 border-slate-200/25 rounded-sn">{{ race.title.location }}</span>
                  {{ race.title.text }}
                  <span v-if="(race.tabulationStatus == 'Active Tabulation')" class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header relative bottom-px">LIVE</span></h4>
              <div class="flex gap-2 items-center mt-2 pr-2">

                <div class="bg-slate-700 w-full h-1">
                  <div class="h-full bg-slate-200" :style="{'width': race.eevp + '%'}"></div>
                </div>

                <p class="text-xs text-nowrap">{{race.eevp}}% reporting</p>
              </div>
            </div>

            <div class="flex gap-2">

              <div class="w-full md:w-80">

                <ResultTable :race="race" :unit="getTopReportingUnit(race)" :max="2" :reporting="false"/>

              </div>
            </div>
        </div>


    </div>

    </a>
</template>

