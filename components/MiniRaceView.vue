<script lang="ts" setup>
  import Race from '~/server/types/Race';
import type { Raw } from '~/server/utils/Raw';
 import { notZero } from '~/server/utils/Util';

  const props = defineProps<{
    race: Raw<Race>,
    isPinned: boolean,
  }>();

  let title = "";
  let desc = "";
  let mounted = true;

  console.log(props.race.candidates);

  /*onMounted(() => {
    let r = new Race(props.race);

    title = r.getTitle();
    desc = r.getDescription();

    mounted = true;
  })*/
  
  

</script>

<template>
  <a class="race relative transition-colors" v-if="mounted">

    <!-- Pin Button -->
    <div @click="$emit('pin')" :class="[isPinned ? 'bg-lte-yellow text-slate-950 hover:brightness-75' : 'bg-slate-900/75 hover:brightness-125']" class="absolute top-0 right-0 h-7 w-7 p-1 rounded-bl-md flex items-center justify-center hover:cursor-pointer ">
        <Icon :name="race ? 'pajamas:thumbtack-solid' : 'pajamas:thumbtack'"/>
    </div>

    <div @click="$emit('select')" class="card p-3 pl-6 hover:bg-slate-800 hover:cursor-pointer">
        <div class="absolute left-0 top-0 h-full w-2 bg-lte-yellow rounded-l-sm"></div>

        

        <div class="flex w-full justify-between items-start">
            <div class="flex-1">
                <h4 class="text-lg">{{ race.title }} <span v-if="(race.tabulationStatus == 'Active Tabulation')" class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header relative bottom-px">LIVE</span></h4>
                <p class="text-sm">{{ race.description }}</p>
            </div>

            <div class="flex gap-2">

              <div class="w-80">

                <ResultTable :unit="race" :max="2" :reporting="false"/>

              </div>
            </div>
        </div>

        <div class="flex gap-2 items-center mt-2">

            <div class="bg-slate-700 w-full h-1">
                <div class="h-full bg-slate-200" :style="{'width': race.reportingUnits[0].eevp + '%'}"></div>
            </div>

            <p class="text-xs text-nowrap">{{race.reportingUnits[0].eevp}}% reporting</p>
        </div>
    </div>

    </a>
</template>

