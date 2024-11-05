<script setup lang="ts">
import {useIntervalFn} from '@vueuse/core';
import HouseDashboard from '~/components/home/HouseDashboard.vue';
import SenateDashboard from '~/components/home/SenateDashboard.vue';
import NapkinItem from '~/components/napkin/NapkinItem.vue';
import Projectomatic from '~/components/napkin/Projectomatic.vue';
import CandidateBattle from '~/components/presidential/CandidateBattle.vue';
import {getMostLikelyCandidate} from '~/server/utils/Util';
import type { ApiHomeDashboard } from "~/server/api/homeDashboard";
import { keys } from '~/server/utils/Util';
import axios from "axios";
import States from "~/server/utils/States";
import type {ApiState} from "~/server/types/ApiTypes";
import PartyBattle from "~/components/presidential/PartyBattle.vue";
import type {Race} from "~/server/types/ViewModel";


useSeoMeta({
    title: "Home",
    ogImage: "/og-image.png",
});

const { data: homeDashboard, refresh } = useFetch("/api/homeDashboard", {
  transform: (ret: ApiHomeDashboard) => {
    try {
      for (let candidate of ret.presRace.candidates) {
        candidate.party = ret.parties[keys(ret.parties).includes(candidate.party as unknown as string) ? candidate.party as unknown as string : 'Ind'];
      }

      for(let key of Object.keys(ret.presRaces)){
        let split = key.split("-");
        ret.presRaces[key].state = States.find(x => x.postalCode == split[0]) as unknown as ApiState;
        ret.presRaces[key].seatNum = split.length > 0 ? Number(split[1]) : -1;
      }


      return ret as ApiHomeDashboard;
    } catch(e){
      console.error(e);
      throw e;
    }
  },
  server: false,
});


onMounted(async () => {

  setInterval(async () => {
    await refresh();
  }, 30000);

});

const mockSenateRace = computed(() => {

    let candidates: any[] = [];
    let results: {[key: string]: any} = {};

    for(let polID of keys(homeDashboard.value?.senateModel)){

      let party = homeDashboard.value?.parties[polID];

      if(!party){
        party = homeDashboard.value?.parties['Ind'];
      }

      let label = "No Majority";
      if(polID == 'Dem') label = "Democrats";
      else if (polID == 'GOP') label = "Republicans";

      candidates.push({
        polID: polID,
        fullName: label,
        last: label,
        party: party,
      });

      results[polID] = {
        probability: homeDashboard.value?.senateModel[polID]
      }

    }

    return {
      uuid: "senate",
      state: "US",
      results: results,
      candidates: candidates,
      call: {
        winner: null,
        calls: []
      }
    } as any;
})


</script>

<template>

    <Container v-if="homeDashboard">

        <div class="xl:flex mt-4 gap-4 items-center">
            <div class="xl:w-1/2 w-full">
                <h1 class="text-2xl text-center py-4"><img class="h-12 inline-block mr-2" src="/img/logo.png"/>Presidential Race Overview</h1>
                <div class="card">



                    <CandidateBattle :home-dashboard="(homeDashboard)" :race="(homeDashboard.presRace)"/>
                    
                    <div class="p-4">
                        <NapkinItem :color="(getMostLikelyCandidate(homeDashboard.presRace).party?.colors[0] || '#ffffff')">
                            <Projectomatic :race="(homeDashboard.presRace)" :forceSmall="false"/>
                        </NapkinItem>
                    </div>
                    
                </div>
            </div>
            
            <div class="w-full xl:w-1/2">
                <!--<ZoomableMap :race="(presRace)" minHeight="500px"/>-->
                <PresidentialMap :home-dashboard="homeDashboard" :race="(homeDashboard.presRace)" minHeight="500px"/>
            </div>

        </div>

       <div class="mt-4">

            <div class="grid xl:grid-cols-2 gap-4 flex items-center">
                <div class="order-1 sm:order-0">
                  <ChamberMap :type="'senate'" :home-dashboard="homeDashboard" minHeight="500px"/>
                </div>
                <div class="card p-4">
                  <PartyBattle :gop-number="homeDashboard.values.senate.GOP" :dem-number="homeDashboard.values.senate.Dem" :label="'Senate'" :needed="50" />

                  <Projectomatic class="mt-4" v-if="mockSenateRace != null" :plural="true" :race="mockSenateRace" :force-small="false"/>
                    <!--<SenateDashboard :races="senateRaces"/>-->
                </div>

            </div>

         <div class="mt-12">
           <div class="w-full xl:w-2/3 mx-auto mb-4">
             <div class="card px-6 py-4">
               <PartyBattle :gop-number="homeDashboard.values.house.GOP" :dem-number="homeDashboard.values.house.Dem" :label="'House'" :needed="218" />
               <!--<HouseDashboard :races="houseRaces"/>-->
             </div>


           </div>
           <ChamberMap :type="'house'" :home-dashboard="homeDashboard" minHeight="600px"/>

         </div>

        </div>




        
    </Container>

</template>

<style>

</style>