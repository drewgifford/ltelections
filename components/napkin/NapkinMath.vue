<script setup lang="ts">
import type Race from '~/server/types/Race';



const props = defineProps<{
    race: Race
}>();


</script>

<template>
    <Projectomatic v-if="(race.candidates.length > 1)" :race="race" :forceSmall="false"/>
    <KeyToVictory v-if="(race.candidates.length > 1)" class="mt-6" :race="(race)"/>
    <OutstandingVote v-if="(race.candidates.length > 1)" class="mt-6" :race="(race)"/>

</template>