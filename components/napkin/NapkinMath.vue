<script setup lang="ts">
import { getMostLikelyCandidate } from '~/server/utils/Util';
import type {Race} from "~/server/types/ViewModel";



const props = defineProps<{
    race: Race
}>();


</script>

<template>
    <NapkinItem v-if="(race.candidates.length > 1 && race.hasProjectomatic)" :color="(getMostLikelyCandidate(race).party.colors[0] || '#ffffff')">
        <Projectomatic :race="(race)" :forceSmall="false"/>
    </NapkinItem>
    <KeyToVictory v-if="(race.candidates.length > 1)" class="mt-6" :race="(race)"/>
    <OutstandingVote v-if="(race.candidates.length > 1)" class="mt-6" :race="(race)"/>

</template>