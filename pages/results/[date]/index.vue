<script setup lang="ts">
import States from '~/server/utils/States';
import LoadingSection from '~/components/LoadingSection.vue';
import { useIntervalFn } from "@vueuse/core";
import {officeTypeFromString, officeTypeToString, sortRaces} from '~/server/utils/Util';
import type {Race, RaceQueried} from "~/server/types/ViewModel";
import type OfficeType from "~/server/types/enum/OfficeType";
import axios from "axios";
import { keys } from '~/server/utils/Util';
import {parseAPIResponse} from "~/server/utils/ParseAPI";
import {unpack} from "msgpackr";

    const route = useRoute();
    const router = useRouter();

    const officeID = ref(officeTypeFromString(route.query.office as string || '*'));
    const statePostal = ref(route.query.state as string || '*');

    watch(statePostal, (statePostal) => {
        router.push({ query: { "state": statePostal, "office": officeTypeToString(officeID.value as OfficeType) } });
    });
    watch(officeID, (officeID) => {
        router.push({ query: { "state": statePostal.value, "office": officeTypeToString(officeID as OfficeType) } });
    });

    const pinnedRaceIds = ref<string[]>([]);
    //const races = ref<RaceQueried[]>([]);

    useSeoMeta({
        title: "Race Dashboard",
        ogImage: "/og-image.png",
    });

    const { data: races, refresh } = await useFetch<RaceQueried[]>('/api/searchRaces', {
      query: {
        statePostal: statePostal,
        officeID: officeID,
        raceUUIDs: pinnedRaceIds,
        date: route.params.date
      },
      server: false,
      transform: (res: any) => {
        try {
          return parseAPIResponse(res);
        }
        catch(e){
          console.error(e);
        }

      }
    });

    onMounted(async () => {
      let interval: any = null;

      function resetInterval(){
        if(interval) clearInterval(interval);
        interval = setInterval(async () => {
          console.log("Refreshing");
          await refresh();
        }, 30000);
      }

      //pinnedRaceIds.value = JSON.parse(localStorage.getItem("pinnedRaces")??'[]');

      watch(statePostal, async (statePostal) => {
        await refresh();
        resetInterval();
      });
      watch(officeID, async (officeID) => {
        await refresh();
        resetInterval();
      });

      resetInterval();

    });



    // Pin races functionality
    const togglePin = (race: RaceQueried) => {

        if(!races.value) return;

        let index = races.value?.indexOf(race);
        let idIndex = pinnedRaceIds.value.indexOf(race.uuid);

        if(race.pinned){

            // Remove pin
            races.value[index].pinned = false;
            pinnedRaceIds.value.splice(idIndex, 1);
            localStorage.setItem('pinnedRaces', JSON.stringify(pinnedRaceIds.value));
            
        } else {

            // Add pin
            races.value[index].pinned = true;

            if(idIndex < 0) {
              pinnedRaceIds.value.push(race.uuid as string);
              localStorage.setItem('pinnedRaces', JSON.stringify(pinnedRaceIds.value));
            }

        }
        
    }


    let states = States;

    const raceView = ref<string | null>(null);
    const setView = (race: RaceQueried) => {
        raceView.value = race.uuid;
    }
    const raceViewObject = computed(() => {

      return races.value?.find(x => x.uuid == raceView.value);

    });

    const nonPinnedRaces = () => {
      if(!races) return [];
      return sortRaces(races.value?.filter(x => x.inQuery) as Race[]);
    }



</script>

<template>

    <Container class="mt-4">
        <div class="xl:flex gap-6">
            
            <div class="flex flex-col gap-6 w-full xl:w-1/2">

                <form class="flex gap-4 p-4 card z-10 sticky top-24 w-full items-stretch">
                    <div class="flex-1">
                        <label for="location">Location</label>
                        <div class="relative w-full">
                            <!--<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>-->

                            <select v-model="statePostal" id="location" class="block w-full px-4 py-2 bg-slate-800 rounded-lg transition-all outline-none hover:bg-slate-700">
                                <option value="*" selected>National</option>
                                <option v-for="(state) of states" :value="(state.postalCode)">{{ state.name }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex-1">
                        
                        <label for="type">Office Type</label>
                        <div class="relative w-full">
                            <!--<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>-->

                            <select v-model="officeID" id="type" class="block w-full px-4 py-2 bg-slate-800 rounded-lg transition-all outline-none hover:bg-slate-700">
                                <option value="*" selected>Any</option>
                                <option value="P">President</option>
                                <option value="S">Senate</option>
                                <option value="H">House</option>
                                <option value="G">Governor</option>
                                <option value="I">Ballot Measure</option>
                            </select>
                        </div>
                    </div>


                </form>

                <!-- Non-pinned races -->
                <div class="flex flex-col gap-3 w-full pb-24">
                    <p>Showing {{ races?.length || 0 }} results</p>

                    <MiniRaceView 
                        v-for="(race, index) of races"
                        :data-race="race.uuid"
                        @select="setView(race as RaceQueried)"
                        @pin="togglePin(race as RaceQueried)"
                        :is-pinned="false"
                        :race="race"
                        :key="race.uuid"
                        :selected="raceView == race.uuid"
                    />
                </div>



                

            </div>

            <div class="display-none xl:block w-full xl:w-1/2">

                <RaceCard v-if="(raceViewObject)" :key="(raceView || '')" :race="(raceViewObject)" :map=true />
                
            </div>

            


        </div>
    </Container>

</template>