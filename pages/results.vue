<script setup lang="ts">
import Race from '~/server/types/Race';
import type State from '~/server/types/State';
import { LocalStorageHandler } from '~/server/utils/LocalStorageHandler';
import axios from 'axios';
import type { CanPin, Raw } from '~/server/utils/Raw';
import States from '~/server/utils/States';

    const statePostal = ref('OH');
    const officeID = ref('*');
    const pinnedRaceIds = ref<string[]>([]);
    const pinnedRaces = ref<(Raw<Race>&CanPin)[]>([]);

    // Query races
    const { data: races, status, error } = useFetch("/api/searchRaces", {
        query: {
            statePostal: statePostal,
            officeID: officeID
        },
        transform: (races: Raw<Race>&CanPin[]) => {
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
        })).data.map((r: Raw<Race>&CanPin) => {
            r.pinned = true;
        });
    });

    // Pin races functionality
    const togglePin = (race: Raw<Race>&CanPin) => {

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
    const setView = (race: Raw<Race>) => {
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
                <div class="flex-1 relative card !bg-slate-950/25" v-else>

                    <div role="status" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

                        <svg aria-hidden="true" class="inline w-12 h-12 text-slate-800 animate-spin fill-lte-blue" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>

                        <span class="sr-only">Loading...</span>
                    </div>

                </div>

                

            </div>

            <div class="w-1/2">

                <RaceCard :key="(d)" :race="(raceView)" v-if="(raceView != null)"/>
                
            </div>

            


        </div>
    </Container>

</template>