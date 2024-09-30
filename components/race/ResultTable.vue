<script setup lang="ts">
import type Race from '~/server/types/Race';
import type ReportingUnit from '~/server/types/ReportingUnit';
import { notZero } from '~/server/utils/Util';


const { unit, max, reporting = true} = defineProps<{
    unit: Raw<Race> | Raw<ReportingUnit>,
    max: number,
    reporting: boolean
}>();


</script>

<template>

    <div class="flex w-full" v-for="candidate of unit.candidates.slice(0, max)">

        <div :style="[{backgroundColor: candidate.partyData?.colors[0]}]" class="rounded-l-sm text-xs px-1 flex items-center font-header text-center">{{ candidate.partyData?.shorthand }}</div>

        <div :style="[{backgroundColor: candidate.partyData?.colors[0]+'40'}]" class="flex flex-1 px-2 py-1 justify-between items-center rounded-r-sm">
            <p class="text-sm text-slate-200">{{ candidate.last }}</p>

            <div class="text-right">
                <p class="text-sm text-slate-200"><span class="text-xs text-slate-200/50">{{ (candidate.voteCount || 0).toLocaleString() }}</span>&nbsp;{{ (((candidate.voteCount || 0) / notZero(unit.parameters.vote?.total) as number)*100).toFixed(2) }}%</p>
            </div>
        </div>
    </div>

    <div v-if="reporting" class="flex gap-2 items-center mt-2">

        <div class="bg-slate-700 w-full h-1">
            <div class="h-full bg-slate-200" :style="{'width': unit.eevp + '%'}"></div>
        </div>

        <p class="text-xs text-nowrap">{{unit.eevp}}% reporting</p>
    </div>

</template>