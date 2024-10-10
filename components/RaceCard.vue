<script setup lang="ts">
import type Race from '~/server/types/Race';
import { OfficeType } from '~/server/types/Race';
import { nth } from '~/server/utils/Util';


const props = defineProps<{
    race: Raw<Race>
}>();

let winner = props.race.candidates.find(cand => cand.winner == 'X');

const getText = () => {

    let race = props.race;
    let candidates = race.candidates;
    let status = race.raceCallStatus;
    

    let stateLabel = `${race.state?.name}`;

    if(race.officeID == OfficeType.House){
        stateLabel += `'s ${race.seatNum || 1}${nth(race.seatNum || 1)}`
    }



    if(status == "Called"){

        let winner = candidates.find(cand => cand.winner);

        if(!winner) return "An error has occurred.";

        if(candidates.length == 1) {
            return `${winner.first} ${winner.last} has won uncontested in ${stateLabel}.`;
        }
        let loser = candidates[1];
        
        return `${winner.first} ${winner.last} has defeated ${loser.first} ${loser.last} in ${stateLabel}.`

    }
    else {
        return "Not set up yet";
    }

}


</script>

<template>

    <div class="card top-24 sticky">
        <CandidateBattle :race="(race)" v-if="(!winner)"/>
        <ProjectedWinner :race="(race)" v-if="(winner)"/>
        <div class="p-4 flex bg-slate-950/25">

            <div class="w-1/2 p-2">
                <h1 class="text-xl">{{ getText() }}</h1>
                <p class="mb-4 text-sm">Last updated 9/30/2024 2:51PM ET</p>

                <div class="p-2 card border-slate-600 border">
                    <ResultTable :unit="race" :max="5" :reporting="true"/>
                </div>

                <!-- Napkin math -->

                 <div class="mt-4 card p-4">

                    <p class="text-md font-header">LTE Project-o-matic</p>
                    <div class="flex">
                        <h1 class="text-xl">>99% Trump</h1>
                    </div>
                    <p class="text-xs"><i>Probability based on historical Presidential data and topline polling averages. May not be accurate.</i></p>

                 </div>

                
            </div>

            <div class="w-1/2 p-4 rounded-md shadow-inner">
                <ZoomableMap :race="(race)" map-type="counties"/>
            </div>
        </div>
       
    </div>
</template>