<script setup lang="ts">
import { max } from 'd3';
import type Race from '~/server/types/Race';
import type ReportingUnit from '~/server/types/ReportingUnit';
import { getRaceProbabilities, hasProjectOMatic, roundPercentage } from '~/server/utils/RaceProbability';

const props = defineProps<{
        race: Race
    }>();

const outstandingVote = computed(() => {

    let c = props.race.reportingUnits.filter(x => x.reportingunitLevel == 2);


    const getOutstanding = (ru: ReportingUnit) => {
        return ((ru.parameters.vote?.expected.actual || 0) - (ru.parameters.vote?.total || 0))
    }

    let counties = c.toSorted((a: ReportingUnit,b: ReportingUnit) => {
        return (getOutstanding(a) > getOutstanding(b)) ? -1 : 1;
    });

    let retVal = [];

    for(let ru of counties.slice(0, 4)){

        let bars = [];

        if(ru.candidates.length > 0 && ru.candidates[0]){
        
            let leadingParty = ru.candidates[0].partyData;
            let margin = (ru.candidates[0].voteCount || 0) - (ru.candidates[1].voteCount || 0);
            let maxPercent = 0;

            for(let candidate of ru.candidates.slice(0, 2)){
                let percent = (candidate.voteCount || 0) / (ru.parameters.vote?.total || 1);
                bars.push({
                    color: candidate.partyData?.colors[0],
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
            }
        }

    }




    return retVal;


});

</script>

<template>

    <div class="flex gap-4" v-if="(outstandingVote && outstandingVote.length > 0)">

        <div class="w-2 rounded-sm bg-slate-600"></div>

        <div class="flex-1">
            <p class="my-1"><b class="font-header">Outstanding Vote:</b> Key counties currently have outstanding votes.</p>
            
            <div class="flex gap-6">

                <div class="w-full mt-2" v-for="(elem, index) of outstandingVote">

                    <p class="text-md font-header">{{ elem.name }}</p>
                    <p class="text-sm mt-1 inline-block rounded-sm py-1 px-2 text-white" :style="{backgroundColor: elem.leadingParty?.colors[0]+'80'}">{{ elem.leadingParty?.id }} +{{ elem.margin.toLocaleString() }}</p>
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