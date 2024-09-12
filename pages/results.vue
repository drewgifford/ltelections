<script setup lang="ts">
import type Race from '~/server/Race';

    const statePostal = ref("*");
    const officeID = ref("*");

    const getRaceTitle = (race: Race) => {

        if(race.officeID == "P"){
            return race.officeName;
        }
        if(race.officeID = "H"){
            return race.seatName;
        }
        if(race.officeID = "")

        return race.officeName;

    }
    const getRaceDescription = (race: Race) => {
        if(race.officeID == "P"){
            return `Presidential Race`;
        }
        if(race.officeID = "H"){
            return `${race.officeName} race - ${race.reportingUnits[0].stateName}'s ${race.seatNum}st district`;
        }
    }

    const { data: races, status, error, refresh } = useFetch("/api/searchRaces", {

        query: {
            statePostal: statePostal,
            officeID: officeID
        },

        transform: (races: Race[]) => {
            console.log(races);
            return races
        }
    });

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
                                <option value="AL">Alabama</option>
                                <option value="AK">Alaska</option>
                                <option value="AZ">Arizona</option>
                                <option value="OH">Ohio</option>
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

                <div class="flex flex-col gap-6 w-full">

                    <a v-for="(race, index) in races?.values()" class="race card p-4 pl-6 relative hover:bg-slate-800 hover:cursor-pointer transition-colors">
                        <div class="absolute left-0 top-0 h-full w-2 bg-lte-yellow rounded-l-md"></div>

                        <div class="flex w-full justify-between">
                            <div>
                                <h3 class="text-2xl">{{ race.reportingUnits[0].statePostal }} - {{ getRaceTitle(race) }} <span class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header relative bottom-px">LIVE</span></h3>
                                <p>{{ getRaceDescription(race) }}</p>
                            </div>

                            <div class="flex gap-2">
                                <div class="flex bg-lte-red/75 rounded-md gap-2 items-center pr-3">
                                    <div class="relative">
                                        <NuxtImg
                                            src="/img/donald_trump.png"
                                            alt=""
                                            class="w-14 aspect-square"
                                        />
                                        <div class="absolute bottom-0 left-0 bg-lte-red px-1 rounded-tr-md rounded-bl-md shadow-inner">
                                            <p class="font-header text-sm">R</p>
                                        </div>
                                    </div>
                                    

                                    <div class="text-right">
                                        <h3 class="text-xl">50.5%</h3>
                                        <p class="text-sm text-slate-200/75">1,500,523</p>
                                    </div>
                                    
                                </div>

                                <div class="flex bg-lte-blue/25 rounded-md gap-2 items-center pr-3">
                                    <div class="relative">
                                        <NuxtImg
                                            src="/img/donald_trump.png"
                                            alt=""
                                            class="w-14 aspect-square"
                                        />
                                        <div class="absolute bottom-0 left-0 bg-lte-blue px-1 rounded-tr-md rounded-bl-md shadow-inner">
                                            <p class="font-header text-sm">D</p>
                                        </div>
                                    </div>

                                    <div class="text-right">
                                        <h3 class="text-xl">49.5%</h3>
                                        <p class="text-sm text-slate-200/75">1,451,743</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center mt-2">

                            <div class="bg-slate-700 w-full h-1">
                                <div class="h-full bg-slate-200" style="width: {{ race.reportingUnits[0].eevp }}%"></div>
                            </div>

                            <p class="text-xs text-nowrap">{{race.reportingUnits[0].eevp}}% reporting</p>
                        </div>
                        
                    </a>
                </div>

            </div>

            <div class="w-1/2">
                
                <div class="card sticky top-24">
                    <CandidateBattle/>

                    <div class="p-4">
                        <p>Ohio &gt; President</p>
                        <h3 class="text-2xl mb-4">Donald Trump is leading Kamala Harris in Ohio.</h3>
                        <a class="bg-lte-yellow px-4 py-2 text-slate-900 rounded-lg" href="/">See Detailed Results</a>
                    </div>
                    <div class="bg-slate-950/25 p-4 rounded-md shadow-inner">
                        <img class="mx-auto" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Ohio_Presidential_Election_Results_2020.svg/500px-Ohio_Presidential_Election_Results_2020.svg.png"/>
                        <p class="px-4 text-right">Last updated 11/5/2024 at 8:25PM EST</p>
                    </div>
                </div>
            </div>

            


        </div>
    </Container>

</template>