<script setup lang="ts">
import { max } from 'd3';
import type {Race, RaceReportingUnit, ReportingUnit} from "~/server/types/ViewModel";
import {getVotes, keys, sortCandidates} from "~/server/utils/Util";
import { roundPercentage } from "~/server/utils/RaceProbability";

const props = defineProps<{
        race: Race
    }>();

const { data: reportingUnitData, refresh: refreshRUs } = useFetch(`https://l2bytldico4wuatx.public.blob.vercel-storage.com/reportingUnits/${props.race.state.postalCode}.json`,
    {
      transform: (res) => {
        return res as unknown as {[key: string]: any}
      },
      server: false,
      immediate: false,
      watch: false,
    }
);

/* GET RESULTS */
const { data: outstandingVote, status, refresh } = useFetch("/api/results", {
  query: {
    raceUuid: props.race.uuid
  },
  watch: [props.race],
  transform: async (res: {[key: string]: ReportingUnit & RaceReportingUnit}) => {

    console.info("Transforming...")
    if(!res) return null;

    if(!reportingUnitData || !keys(reportingUnitData.value || {}).includes(props.race.state.stateID)){
      console.info("UH OH...")
      await refreshRUs();
    }

    console.info("Phew...")

    for(let obj of Object.entries(res)){

      obj[1] = Object.assign(obj[1], (reportingUnitData.value as any)[obj[0]]);
    }

    console.info("AHHHH")


    let r = res;
    //let r = keyBy(Object.values(res).filter(x => x.reportingunitLevel == 2), 'fipsCode') as {[fips: string]: RaceReportingUnit};

    console.info("we good?")

    if(keys(res).includes(props.race.state.stateID)){
      r[props.race.state.stateID] = res[props.race.state.stateID];
    }
    console.info("Almost done!", r);
    return getOutstandingVote(r);
  },
  server: false,
});



const getOutstandingVote = (results: any) => {

  if(results == null) return null;

  let countyIDs = Object.keys(results).filter(e => e != props.race.state.stateID);


    const getOutstanding = (ru: RaceReportingUnit) => {
        return ((ru.expectedVotes || 0) - (ru.totalVotes || 0))
    }

  let counties = countyIDs.toSorted((a: string,b: string) => {
      return (getOutstanding(results[a]) > results[b]) ? -1 : 1;
  });

    let retVal = [];

    console.log("counties", counties);
    for(let ruid of counties.slice(0, 4)){

      let ru = results[ruid];

        let bars = [];
        if(keys(results).length > 0){

            let ruCandidates = sortCandidates(props.race, ru);

            let leadingCand = ruCandidates[0];
            let leadingParty = leadingCand.party;

            console.log(leadingCand, leadingParty);

            let margin = props.race.results[ruCandidates[0].polID].vote - props.race.results[ruCandidates[1].polID].vote;
            let maxPercent = 0;

            console.log(margin);

            for(let candidate of ruCandidates.slice(0, 2)){
                let percent = getVotes(props.race, candidate) / (ru.totalVotes || 1);
                bars.push({
                    color: candidate.party.colors[0],
                    percent: percent
                })

                if(percent > maxPercent) maxPercent = percent;
            }

            let outstanding = getOutstanding(ru);

            if(outstanding > 0){
                retVal.push({
                    bars: bars,
                    name: ru.reportingunitName,
                    margin: margin,
                    reporting: ru.eevp,
                    leadingParty: leadingParty,
                    outstanding: getOutstanding(ru),
                    maxPercent: maxPercent + 0.1
                });

                console.log(retVal);
            }
        }

    }




    return retVal;


};


</script>

<template>

    <div class="hidden sm:flex gap-4 pb-4" v-if="(outstandingVote && outstandingVote.length > 0)">

        <div class="w-2 rounded-sm bg-slate-600"></div>

        <div class="flex-1">
            <p class="my-1"><b class="font-header">Outstanding Vote:</b> Key counties currently have outstanding votes.</p>
            
            <div class="sm:grid sm:grid-cols-2 md:flex flex gap-6">

                <div class="w-1/2 md:w-full mt-2" v-for="(elem, index) of outstandingVote">

                    <p class="text-md font-header">{{ elem.name }}</p>
                    <p class="text-sm mt-1 inline-block rounded-sm py-1 px-2 text-white" :style="{backgroundColor: elem.leadingParty?.colors[0]+'80'}">{{ elem.leadingParty?.partyID }} +{{ elem.margin.toLocaleString() }}</p>
                    <p class="text-sm mt-1">~{{ elem.outstanding.toLocaleString() }} remain</p>

                    <div class="flex mt-2">

                        <div class="grow-1 w-full h-24 max-w-14 flex flex-col justify-end" v-for="(bar, index) of elem.bars">
                            
                            <div class="w-full rounded-tl-sm rounded-tr-sm" :style="{height: roundPercentage(bar.percent/elem.maxPercent), backgroundColor: bar.color+'80'}"></div>
                            <p class="text-xs text-center inline-block rounded-sm p-1 mt-1 mx-1 text-white" :style="{backgroundColor: bar.color+'80'}">{{ roundPercentage(bar.percent) }}</p>
                        </div>

                    </div>
                    
                    <p class="text-sm mt-1">{{ elem.reporting }}% reporting</p>

                </div>
            </div>
            


        </div>


    </div>


</template>