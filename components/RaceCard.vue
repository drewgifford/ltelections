<script setup lang="ts">
import type Race from '~/server/types/Race';


const props = defineProps<{
    race: Raw<Race>
}>();

console.log(props.race);


</script>

<template>

    <div class="card top-24 sticky">
        <CandidateBattle :race="(race)"/>
        <div class="p-4">

            <ResultTable :unit="race" :max="5" :reporting="true"/>

            <p>{{ race.reportingUnits[0].statePostal }} &gt; President</p>
            <h3 class="text-2xl mb-4">Donald Trump is leading Kamala Harris in Ohio.</h3>
            <a class="bg-lte-yellow px-4 py-2 text-slate-900 rounded-lg" href="/">See Detailed Results</a>
        </div>
        <div class="bg-slate-950/25 p-4 rounded-md shadow-inner">
            
            <ZoomableMap :race="(race)" map-type="counties"/>
            <p class="px-4 text-right">Last updated 11/5/2024 at 8:25PM EST</p>
        </div>
    </div>
</template>