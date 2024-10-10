<script setup lang="ts">
import Race, { type RacePinnable } from '~/server/types/Race';
import type State from '~/server/types/State';
import { LocalStorageHandler } from '~/server/utils/LocalStorageHandler';
import axios from 'axios';
import type { CanPin, Raw } from '~/server/utils/Raw';
import States from '~/server/utils/States';
import LoadingSection from '~/components/LoadingSection.vue';

    const statePostal = ref('OH');
    const officeID = ref('*');
    const pinnedRaceIds = ref<string[]>([]);
    const pinnedRaces = ref<(Race)[]>([]);

    // Query races
    const { data: races, status, error } = useFetch("/api/searchRaces", {
        query: {
            statePostal: statePostal,
            officeID: officeID
        },
        transform: (races: RacePinnable[]) => {
            return races.map(r => {
                
                r.pinned = false;
                return r;
            });
            
        }
    });

    onMounted(async () => {
        pinnedRaceIds.value = JSON.parse(localStorage.getItem("pinnedRaces")??'[]');

        // Get initial pinned races
        pinnedRaces.value = (await axios.get("/api/searchRaces", {
            params: {
                raceUUIDs: pinnedRaceIds.value
            }
        })).data.map((r: RacePinnable) => {
            r.pinned = true;
        });
    });

    // Pin races functionality
    const togglePin = (race: RacePinnable) => {

        let index = pinnedRaces.value.indexOf(race);
        let idIndex = pinnedRaceIds.value.indexOf(race.uuid);

        if(race.pinned){

            // Remove pin
            pinnedRaces.value.splice(index, 1);
            pinnedRaceIds.value.splice(idIndex, 1);
            race.pinned = false;
            
        } else {

            // Add pin
            if(index < 0) pinnedRaces.value.push(race);
            if(idIndex < 0) pinnedRaceIds.value.push(race.uuid as string);
            race.pinned = true;

        }
        
    }


    let states = States;

    const raceView = ref<Race | null>(null);

    let d = 0;
    const setView = (race: Race) => {
        raceView.value = race;
    }
    watch(raceView, () => d++);

    /*

    const pinnedRaces = ref<Race[]>([]);

    const { data: races, status, error, refresh } = useLazyFetch("/api/searchRaces", {

        query: {
            statePostal: statePostal,
            officeID: officeID,
        },

        transform: (races: Race[]) => {
            return races;
        }
    });

    const filterFullList = () => {
        return races.value?.filter(x => (x.officeID == officeID.value  || officeID.value == '*') && (x.reportingUnits[0].statePostal == statePostal.value || statePostal.value == '*'));
    }

    const togglePin = (race: Race) => {

        /*var localRaces = LocalStorageHandler.getItem("pinnedRaces") || [];
        var raceInList = races.value?.find(x => raceIsEqual(x, race)) || null;

        const raceUUID = getUniqueRaceId(race);

        race.isPinned = !race.isPinned;
        if(race.isPinned){
            console.log("PINNED RACE!", race);

            if(raceInList) raceInList.isPinned = true;

            pinnedRaces.value.push(race);

            if(!localRaces.includes(raceUUID)) localRaces?.push(raceUUID);
            
        } else {

            console.log("UNPINNED RACE!", race);

            if(raceInList) raceInList.isPinned = false;

            pinnedRaces.value.splice(pinnedRaces.value.indexOf(race), 1);
            localRaces.splice(localRaces.indexOf(raceUUID), 1);
        }

        LocalStorageHandler.setItem("pinnedRaces", localRaces);
    }

    const setView = (race: Race) => {
        raceView.value = null;
        raceView.value = race;
    }

    watch(statePostal, (s) => {
        let a = LocalStorageHandler.getItem("lastSearch") || {} as any;
        a.statePostal = statePostal.value;
        LocalStorageHandler.setItem("lastSearch", a);
    });

    watch(officeID, (s) => {
        let a = LocalStorageHandler.getItem("lastSearch") || {} as any;
        a.officeID = officeID.value;
        LocalStorageHandler.setItem("lastSearch", a);
    });

    var d = 0;

    watch(raceView, (s) => {
        d++;
    })*/


</script>

<template>

    <Container class="mt-4">
        <div class="flex gap-6">
            
            <div class="flex flex-col gap-6 w-1/2">

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
                <div v-if="(pinnedRaces.length > 0)" class="flex flex-col gap-3 w-full">
                    <p>{{ pinnedRaces?.length }} races pinned</p>
                    <MiniRaceView 
                        v-for="(race, index) of pinnedRaces?.values()"
                        :data-race="race.uuid"
                        @select="setView(race)"
                        @pin="togglePin(race)"
                        :is-pinned="race.pinned"
                        :race="race"
                        class="race relative transition-colors"
                    />
                </div>

                <!-- Non-pinned races -->
                <div v-if="status !== 'pending'" class="flex flex-col gap-3 w-full pb-24">
                    <p>Showing {{ races?.length }} results</p>

                    <MiniRaceView 
                        v-for="(race, index) of races?.values()"
                        :data-race="race.uuid"
                        @select="setView(race)"
                        @pin="togglePin(race)"
                        :is-pinned="race.pinned"
                        :race="race"
                    />
                </div>

                <!-- Loader for non-pinned races -->
                 <LoadingSection v-else/>

                

            </div>

            <div class="w-1/2">

                <RaceCard :key="(d)" :race="(raceView)" v-if="(raceView != null)"/>
                
            </div>

            


        </div>
    </Container>

</template>