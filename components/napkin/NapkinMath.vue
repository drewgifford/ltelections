<script setup lang="ts">
import type Race from '~/server/types/Race';
import { getMostLikelyCandidate } from '~/server/utils/Util';



const props = defineProps<{
    race: Race
}>();


</script>

<template>
    <NapkinItem v-if="(race.candidates.length > 1)" :color="(getMostLikelyCandidate(race).partyData?.colors[0] || '#ffffff')">
        <Projectomatic :race="(race)" :forceSmall="false"/>
    </NapkinItem>
    <KeyToVictory v-if="(race.candidates.length > 1)" class="mt-6" :race="(race)"/>
    <OutstandingVote v-if="(race.candidates.length > 1)" class="mt-6" :race="(race)"/>

</template>