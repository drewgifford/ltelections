<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { getOfficeTypeFromOfficeURL } from '~/server/utils/Util';
import { nth } from '~/server/utils/Util';
import OfficeType from "~/server/types/enum/OfficeType";
import type { Race } from '~/server/types/ViewModel';


    const route = useRoute();

    

    const stateName = (route.params.state as string || '').replace('-',' ').toLowerCase();
    const raceParam = route.params.race as string;
    const officeID = getOfficeTypeFromOfficeURL(raceParam);

    const idTypes = [OfficeType.House, OfficeType.BallotMeasure]

    

    const { data: races, status, error, refresh: refreshRaces } = await useFetch("/api/searchRaces", {
        query: {
            stateName: stateName,
            officeID: officeID,
            date: route.params.date,
        },
        transform: (races: {[key: string]: Race}) => {
            return Object.values(races).filter(r => {

                let s = (route.params.race as string || '').split("-");
                let last = s[s.length-1];
                let lastIdx = (idTypes.includes(officeID as OfficeType) ? 2 : 1)


                if(s.length > lastIdx){
                    if(last == "special" && !r.raceType?.includes("Special")){
                        return false;
                    }
                    if(last != "special" && r.raceType?.includes("Special")){
                        return false;
                    }
                    if(last == "special" && r.raceType?.includes("Special")){
                        return true;
                    }
                }

                

                if(officeID == OfficeType.House || officeID == OfficeType.President){
                    let sn = Number(raceParam.split("-")[1]);
                    if(sn > 0) {
                      return (r.seatNum == Number(raceParam.split("-")[1]));
                    }
                    if(r.seatNum <= 0) return true;
                    return false;

                }
                else if (officeID == OfficeType.BallotMeasure){
                    r.designation = r.designation.replace("_"," ");

                    if(isNaN(Number(r.designation))){
                      return (r.designation == raceParam.split("-")[1].replace("_"," "));
                    } else {
                      return (Number(r.designation) == Number(raceParam.split("-")[1].replace("_"," ")));
                    }

                }
                return true;
            }).splice(0, 1);
        }
    });

    if((races.value?.length || 0) <= 0){
        throw({status: 404})
    }

    const getTitle = () => {

        if(!races.value || races.value.length <= 0) return "";

        let stateName = races.value[0].state.name;

        let raceLabel;

        if(!races.value) return "";

        if(officeID == OfficeType.Senate) raceLabel = `Senate`;
        else if(officeID == OfficeType.President) {
          raceLabel = `Presidential`

          if(races.value[0].seatNum > 0){
            raceLabel = `CD Presidential`;
            stateName += `'s ${races.value[0].seatNum}${nth(Number(races.value[0].seatNum))}`
          }
        }
        else if(officeID == OfficeType.House) {
            raceLabel = `District`;
            stateName += `'s ${races.value[0].seatNum}${nth(Number(races.value[0].seatNum))}`
        }
        else if(officeID == OfficeType.Governor) raceLabel = `Governor`;
        else if(officeID == OfficeType.BallotMeasure) raceLabel = `${races.value[0].officeName} ${races.value[0].designation}`;

        let s = races.value[0].raceType?.includes('Special') ? " Special" : ""

        return `${route.params.date} ${stateName} ${raceLabel}${s} Election Results`;

    };

    useSeoMeta({
    title: () => getTitle(),

    });

    useIntervalFn(async () => {
        await refreshRaces();
    }, 10000);

    const getWinner = (race: Race) => {
        return race.call.winner;
    }


    


</script>

<template>

    
    <Container v-for="(race, index) of races" :key="race.uuid">

        

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
                            <ResultTable :race="race" :unit="race.reportingUnits[race.state.stateID]" :max="5" :reporting="true"/>
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