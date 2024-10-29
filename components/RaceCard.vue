<script setup lang="ts">
import type Race from '~/server/types/Race';
import { OfficeType } from '~/server/types/Race';
import { getOfficeURL, getRaceURL, nth } from '~/server/utils/Util';

const props = defineProps<{
    race: Race,
    map: boolean,
}>();

const hasMap = () => {
    if(props.map == false) return false;
    return true;
}

if(!props.map) props.map = true;

const getWinner = () => {
    return props.race.candidates.find(cand => cand.winner == 'X');
}


const getText = () => {

    let race = props.race;
    let candidates = race.candidates;
    let status = race.raceCallStatus;
    

    let stateLabel = `${race.state?.name}`;

    if(race.officeID == OfficeType.House){
        stateLabel += `'s ${race.seatNum || 1}${nth(race.seatNum || 1)} District`
    }



    if(status == "Called"){

        let winner = candidates.find(cand => cand.winner);

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



let winner = getWinner();

</script>

<template>

    <div class="card top-24 sticky">
        <CandidateBattle :race="(race)" v-if="(!winner)"/>
        <ProjectedWinner :race="(race)" v-if="(winner)"/>
        <div class="p-4 flex bg-slate-950/25">

            <div class="p-2" :class="hasMap() ? ['w-1/2'] : ['w-full']">
                <h1 class="text-xl">{{ getText() }}</h1>
                <p><a :href="getRaceURL(route.params.date as string, race)" class="py-2 px-4 inline-block my-2 bg-lte-yellow !text-slate-900 rounded-sm text-sm font-header">Detailed Race Info ➤</a></p>

                <div class="p-2 card border-slate-600 border">
                    <ResultTable :unit="race" :max="5" :reporting="true"/>
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

