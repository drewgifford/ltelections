<script setup lang="ts">
import OfficeType from '~/server/types/enum/OfficeType';
import type {Race, RaceQueried} from '~/server/types/ViewModel';
import {getOfficeURL, getRaceURL, getTitle, nth} from '~/server/utils/Util';
import RaceCallStatus from "~/server/types/enum/race/RaceCallStatus";
import {parseAPIResponse} from "~/server/utils/ParseAPI";

const props = defineProps<{
    race: Race,
    map: boolean,
}>();



const getText = () => {

    let candidates = props.race.candidates || [];
    let status = props.race.call.status;
    

    let stateLabel = `${props.race.state?.name}`;

    if(props.race.officeID == OfficeType.House){
        stateLabel += `'s ${props.race.seatNum || 1}${nth(props.race.seatNum || 1)} District`
    }



    if(status == RaceCallStatus.Called){

        let winner = props.race.call.winner;

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

    <div class="card top-24 sticky" v-if="race">
        <CandidateBattle :race="(race as Race)" v-if="(!winner)"/>
        <ProjectedWinner :race="(race as Race)" v-if="(winner)"/>
        <div class="p-4 bg-slate-950/25">

            <div class="w-full px-2">
              <h1 class="text-2xl">{{ getTitle(race) }}</h1>
            </div>

            <div class="flex">

              <div class="p-2" :class="map ? ['w-1/2'] : ['w-full']">

                  <p v-if="(race?.summary)" class="text-sm">{{ race.summary }}</p>

                  <p><a :href="getRaceURL(route.params.date as string, race as Race)" class="py-2 px-4 inline-block my-2 bg-lte-yellow hover:brightness-75 !text-slate-900 rounded-sm text-sm font-header">Detailed Race Info ➤</a></p>

                  <div class="p-2 card border-slate-600 border">
                      <ResultTable :race="race as Race" :unit="race as Race" :max="5" :reporting="true"/>
                  </div>

                  <!-- Napkin math -->

                   <div class="card p-4" v-if="(race?.hasProjectomatic)">

                      <Projectomatic :race="(race as Race)" :forceSmall="true"/>

                   </div>

                   <div v-else>
                      <p class="text-sm mt-4">The LTE Projectomatic is not offered for this race.</p>
                   </div>

              </div>

              <div class="w-1/2 p-4 rounded-md shadow-inner" v-if="map">
                  <ZoomableMap minHeight="500px" :race="(race as Race)" map-type="counties"/>
              </div>
            </div>
        </div>
       
    </div>
</template>

