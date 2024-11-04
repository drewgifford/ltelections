<script setup lang="ts">
import States from '~/server/utils/States';
import LoadingSection from '~/components/LoadingSection.vue';
import { useIntervalFn } from "@vueuse/core";
import {officeTypeFromString, officeTypeToString, sortRaces} from '~/server/utils/Util';
import type {Race, RaceQueried} from "~/server/types/ViewModel";
import type OfficeType from "~/server/types/enum/OfficeType";
import axios from "axios";

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

    useSeoMeta({
        title: "Race Dashboard",
        ogImage: "/og-image.png",
    });

    // Query races
    const { data: races, status, error, refresh: refreshRaces } = useFetch("/api/searchRaces", {
        query: {
            statePostal: statePostal,
            officeID: officeID,
            raceUUIDs: pinnedRaceIds,
            date: route.params.date,
        },
        transform: (races: {[key: string]: RaceQueried}) => {
            return sortRaces(Object.values(races).map(r => {
                //r.pinned = pinnedRaceIds.value.includes(r.uuid);
                //r.inQuery = ((statePostal.value == '*' || r.state?.postalCode == statePostal.value) && (officeID.value == '*' || r.officeID == officeID.value));
                return r;
            })) as RaceQueried[];
            
        }
    });



    onMounted(async () => {
      pinnedRaceIds.value = JSON.parse(localStorage.getItem("pinnedRaces")??'[]');

      watch(statePostal, async (statePostal) => {
        await refreshRaces();
      });
      watch(officeID, async (officeID) => {
        await refreshRaces();
      });

    });

    useIntervalFn(async () => {
      await refreshRaces();
    }, 30000);



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

    const nonPinnedRaces = () => {
      if(!races) return [];
      return sortRaces(races.value?.filter(x => x.inQuery) as Race[]);
    }

    const pinnedRaces = computed(() => {
      if(!races) return [];
      return races.value?.filter(x => x.pinned);
    })

    const raceViewSide = computed(() => {
      if(!raceView.value) return null;
      if(!races) return null;
      return races.value?.find(x => x.uuid == raceView.value);
    })



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

                <!-- Pinned races -->
                <div v-if="(pinnedRaces || []).length > 0" class="flex flex-col gap-3 w-full">
                    <p>{{ pinnedRaces?.length }} races pinned</p>
                    <MiniRaceView 
                        v-for="(race, index) of pinnedRaces"
                        :data-race="race.uuid"
                        @select="setView(race)"
                        @pin="togglePin(race)"
                        :is-pinned="race.pinned"
                        :race="race"
                        :key="race.uuid"
                        class="race relative transition-colors"
                    />
                </div>

                <!-- Non-pinned races -->
                <div class="flex flex-col gap-3 w-full pb-24">
                    <p>Showing {{ races?.length }} results</p>

                    <MiniRaceView 
                        v-for="(race, index) of races"
                        :data-race="race.uuid"
                        @select="setView(race as RaceQueried)"
                        @pin="togglePin(race as RaceQueried)"
                        :is-pinned="false"
                        :race="race"
                        :key="race.uuid"
                    />
                </div>



                

            </div>

            <div class="display-none xl:block w-full xl:w-1/2">

                <RaceCard v-if="(raceViewSide != null)" :key="(raceView || '')" :race="(raceViewSide as Race)" :map=true />
                
            </div>

            


        </div>
    </Container>

</template>