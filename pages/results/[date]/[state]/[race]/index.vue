<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import {getOfficeTypeFromOfficeURL, getTitle} from '~/server/utils/Util';
import { nth } from '~/server/utils/Util';
import OfficeType from "~/server/types/enum/OfficeType";
import type { Race } from '~/server/types/ViewModel';
import { parseAPIResponse} from "~/server/utils/ParseAPI";


const route = useRoute();

    

    const stateName = (route.params.state as string || '').replace('-',' ').toLowerCase();
    const raceParam = route.params.race as string;
    const officeID = getOfficeTypeFromOfficeURL(raceParam);

    const { data: races, status, error, refresh: refreshRaces } = await useFetch("/api/race", {
        query: {
            stateName: stateName,
            raceParam: raceParam,
            officeID: officeID,
        },
        transform: (res: any) => {
          if(!res) return null;
          let d = parseAPIResponse(res);
          console.log(d);
          return d;
        },
        server: false,
    });
  const race = computed(() => races.value ? races.value[0] : null);


    if(!race){
        throw({status: 404})
    }




    useSeoMeta({
    title: () => getTitle(race.value),

    });

    useIntervalFn(async () => {
        await refreshRaces();
    }, 30000);

    const getWinner = (race: Race) => {
      console.log(race);
      return race.call.winner;
    }


    


</script>

<template>

    
    <Container :key="race" v-if="race">

        

        <div class="xl:flex gap-6">
            <div class="w-full xl:w-1/2 mt-2">

                <div class="my-4">
                    <p><a :href="`/results/${route.params.date}/?state=${race.state?.postalCode}&office=any`">&lt; See all races in {{ race.state?.name }}</a></p>
                    <h1 class="text-2xl">{{ getTitle() }}</h1>
                </div>

                <div class="card">

                    <CandidateBattle :race="race" v-if="!getWinner(race)"/>
                    <ProjectedWinner :race="race" v-if="getWinner(race)"/>



                    <div class="px-4">
                        <p v-if="(race.summary)" class="text-md mt-4">{{ race.summary }}</p>
                        <div class="p-2 my-4 card border-slate-600 border">
                            <ResultTable :race="race" :unit="race" :max="5" :reporting="true"/>
                        </div>
                        <div class="px-4">
                            <NapkinMath :race="race"/>
                        </div>
                    </div>

                </div>
            </div>

            <div class="w-full xl:w-1/2 relative">
                <ZoomableMap class="sticky top-24" :race="race" minHeight="80vh"/>
            </div>
        </div>

        <div class="xl:flex gap-6 py-12">

            <div class="w-full xl:w-1/2 p-4 card" v-if="(race.candidates.find(x => x.description != ''))">

                <h1 class="text-2xl mb-2 ml-4">About the Candidates</h1>

                <div class="card py-2 px-4  gap-4 flex items-stretch" v-for="(candidate, index) of race.candidates.filter(x => x.description != '')">

                    <div class="flex">
                        <div class="w-2 h-full rounded-sm" :style="{backgroundColor: candidate.party.colors[0]}"></div>
                    </div>
    
                    <div class="flex items-center">
                        <NuxtImg
                        :src="candidate.imageURL"
                        width="125"
                        class="object-cover"

                    />
                    </div>
                    

                    <div class="flex-1 flex flex-col justify-center">
                        <h2 class="text-xl">{{ candidate.first }} {{ candidate.last }}</h2>
                        <p><span class="text-sm py-1 px-2 rounded-md inline-block font-header" :style="{backgroundColor: candidate.party.colors[0]+'80'}">{{ candidate.party.partyID }}</span></p>
                        <p class="text-md mt-2">{{candidate.description}}</p>
                    </div>
                </div>

            </div>

        </div>
        

        

    </Container>

</template>