<script setup lang="ts">
import OfficeType from '~/server/types/enum/OfficeType';
import type { Race } from '~/server/types/ViewModel';
import { getOfficeURL, getRaceURL, nth } from '~/server/utils/Util';
import RaceCallStatus from "~/server/types/enum/race/RaceCallStatus";

const props = defineProps<{
    race: Race,
    map: boolean,
}>();

const hasMap = () => {
    if(props.map == false) return false;
    return true;
}


const getText = () => {

    let race = props.race;
    let candidates = race.candidates;
    let status = race.call.status;
    

    let stateLabel = `${race.state?.name}`;

    if(race.officeID == OfficeType.House){
        stateLabel += `'s ${race.seatNum || 1}${nth(race.seatNum || 1)} District`
    }



    if(status == RaceCallStatus.Called){

        let winner = race.call.winner;

        if(!winner) return "An error has occurred.";

        if(candidates.length == 1) {
            return `${winner.fullName} has won uncontested in ${stateLabel}.`;
        }
        let loser = candidates[1];
        
        return `${winner.fullName} has defeated ${loser.fullName} in ${stateLabel}.`

    }
    else {
        
        return `${candidates[0].fullName} is leading in ${stateLabel}.`


    }

}

const route = useRoute();

const winner = computed(() => {
    return props.race.call.winner;
});

</script>

<template>

    <div class="card top-24 sticky">
        <CandidateBattle :race="(race)" v-if="(!winner)"/>
        <ProjectedWinner :race="(race)" v-if="(winner)"/>
        <div class="p-4 flex bg-slate-950/25">

            <div class="p-2" :class="hasMap() ? ['w-1/2'] : ['w-full']">
                <h1 class="text-xl">{{ getText() }}</h1>
                <p><a :href="getRaceURL(route.params.date as string, race)" class="py-2 px-4 inline-block my-2 bg-lte-yellow hover:brightness-75 !text-slate-900 rounded-sm text-sm font-header">Detailed Race Info ➤</a></p>

                <div class="p-2 card border-slate-600 border">
                    <ResultTable :race="race" :unit="race.reportingUnits[race.state.stateID]" :max="5" :reporting="true"/>
                </div>

                <!-- Napkin math -->

                 <div class="card p-4" v-if="(race.hasProjectomatic)">

                    <Projectomatic :race="(race)" :forceSmall="true"/>

                 </div>

                 <div v-else>
                    <p class="text-sm mt-4">The LTE Project-o-Matic is not offered for this race.</p>
                 </div>
                
            </div>

            <div class="w-1/2 p-4 rounded-md shadow-inner" v-if="hasMap()">
                <ZoomableMap minHeight="500px" :race="(race)" map-type="counties"/>
            </div>
        </div>
       
    </div>
</template>

