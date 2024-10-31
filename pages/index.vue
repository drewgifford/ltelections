<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import HouseDashboard from '~/components/home/HouseDashboard.vue';
import SenateDashboard from '~/components/home/SenateDashboard.vue';
import NapkinItem from '~/components/napkin/NapkinItem.vue';
import Projectomatic from '~/components/napkin/Projectomatic.vue';
import CandidateBattle from '~/components/presidential/CandidateBattle.vue';
import ZoomableMap from '~/components/ZoomableMap.vue';
import { getMostLikelyCandidate } from '~/server/utils/Util';

    
    useSeoMeta({
        title: "Home",
        ogImage: "/og-image.png",
    });


    const { data: homeDashboard, status, error, refresh: refreshRaces } = await useFetch("/api/homeDashboard", {
        query: {
            date: "2024"
        }
    });

    useIntervalFn(async () => {
        await refreshRaces();
    }, 10000);

    const presRace = computed(() => homeDashboard.value?.races.presidential);
    const senateRaces = computed(() => homeDashboard.value?.races.senate);
    const houseRaces = computed(() => homeDashboard.value?.races.house);


</script>

<template>

    <Container>

        <div>
            <!-- Recent Projections-->
            <!--<div class="flex items-center gap-4">
                <h3 class="text-xl w-36">Recent Projections</h3>

                <div class="!bg-lte-blue/40 flex px-4 py-2 rounded-sm items-center gap-4 card">
                    <h1 class="text-xl">D</h1>
                    <div>
                        <h3 class="text-md">New Mexico</h3>
                        <p class="text-sm -mt-1 text-slate-200">President</p>
                    </div>
                </div>
                <div class="!bg-lte-blue/40 flex px-4 py-2 rounded-sm items-center gap-4 card">
                    <h1 class="text-xl">D</h1>
                    <div>
                        <h3 class="text-md">Colorado</h3>
                        <p class="text-sm -mt-1 text-slate-200">President</p>
                    </div>
                </div>
                <div class="!bg-lte-red/40 flex px-4 py-2 rounded-sm items-center gap-4 card">
                    <h1 class="text-xl">R</h1>
                    <div>
                        <h3 class="text-md">Ohio</h3>
                        <p class="text-sm -mt-1 text-slate-200">President</p>
                    </div>
                </div>
                <div class="!bg-lte-red/40 flex px-4 py-2 rounded-sm items-center gap-4 card">
                    <h1 class="text-xl">R</h1>
                    <div>
                        <h3 class="text-md">North Dakota</h3>
                        <p class="text-sm -mt-1 text-slate-200">Senate</p>
                    </div>
                </div>


            </div>-->

        </div>

        <div class="flex mt-4 gap-4 items-center">
            <div class="xl:w-1/2 w-full">
                <h1 class="text-2xl text-center py-4"><img class="h-12 inline-block mr-2" src="/img/logo.png"/>Presidential Race Overview</h1>
                <div class="card">

                    

                    <CandidateBattle :race="(presRace)"/>
                    
                    <div class="p-4">
                        <NapkinItem :color="(getMostLikelyCandidate(presRace).partyData?.colors[0] || '#ffffff')">
                            <Projectomatic :race="(presRace)" :forceSmall="false"/>
                        </NapkinItem>
                    </div>
                    
                </div>
            </div>
            
            <div class="w-full xl:w-1/2">
                <ZoomableMap :race="(presRace)" minHeight="500px"/>
            </div>

        </div>

        <div class="mt-4">
            <!-- Senate Dashboard -->
            <div class="grid xl:grid-cols-2 gap-4">
                <div class="card p-4">
                    <SenateDashboard :races="senateRaces"/>
                </div>
                <div class="card px-6 py-4">
                    <HouseDashboard :races="houseRaces"/>
                </div>
            </div>

        </div>

        
    </Container>

</template>

<style>

</style>