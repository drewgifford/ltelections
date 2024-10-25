<script setup lang="ts">
import type Race from '~/server/types/Race';
import { OfficeType } from '~/server/types/Race';
import type { ReportingCandidate } from '~/server/types/ReportingUnit';
import { getRaceProbabilities, hasProjectOMatic, roundPercentage } from '~/server/utils/RaceProbability';

const props = defineProps<{
        race: Race
    }>();

const keyToVictory = computed(() => {

    

    // Percent of remaining vote for  candidate

    // First method: find incumbent party
    let cand = props.race.candidates[0];
    let otherCand = null;

    if(props.race.candidates.length > 1) {
        cand = props.race.candidates[1];
        otherCand = props.race.candidates[0];
    };

    
    let incumbentCand = props.race.candidates.find(x => x.incumbent) || props.race.incumbents[0] || null;

    if(props.race.lastWinningParty || incumbentCand){
        let incumbentParty = props.race.lastWinningParty;

        

        if(incumbentParty){

            let cand1 = props.race.candidates.find(x => x.party == incumbentParty) || null;
            let cand2;
            if(cand1) cand2 = props.race.candidates.find(x => x.polID != cand1.polID) || null;

            if(cand1 && cand2){
                cand = cand1;
                otherCand = cand2;
            }
        }
        else if (incumbentCand){

            let cand1 = incumbentCand;
            let cand2;
            if(cand1) cand2 = props.race.candidates.find(x => x.polID != cand1.polID) || null;

            if(cand1 && cand2){
                cand = cand1;
                otherCand = cand2;
            }

        }
    }

    if(props.race.officeID == OfficeType.BallotMeasure){
        cand = props.race.candidates.find(x => x.last == 'Yes') as ReportingCandidate;
        otherCand = props.race.candidates.find(x => x.last == 'No') as ReportingCandidate;
    }

    if(!otherCand) return null;

    let gap = (cand.voteCount || 0) - (otherCand.voteCount || 0);



    let expectedVotes = props.race.parameters.vote?.expected.actual || 0
    let votesRemaining = expectedVotes - (props.race.parameters.vote?.total || 0);

    let needed = (votesRemaining - gap)/2;
    let percent = needed/votesRemaining;





    return {
        percent: roundPercentage(percent),
        votesRemaining: votesRemaining,
        votesNeeded: (Math.ceil(needed)),
        color: (cand.partyData?.colors[0]),
        name: `${cand.fullName}`
    };


});

</script>

<template>

    <div v-if="keyToVictory" class="flex gap-4 my-4">

        <div class="w-2 rounded-sm" :style="{backgroundColor: keyToVictory.color}"></div>

        <div class="flex-1">

            <div v-if="(keyToVictory.votesNeeded > 0 && keyToVictory.votesNeeded <= keyToVictory.votesRemaining)">
                <p class="my-1"><b class="font-header">Key To Victory:</b> To win, <span class="text-white py-1 px-2 rounded-sm" :style="{backgroundColor: keyToVictory.color+'80'}">{{ keyToVictory.name }}</span> needs:</p>
                
                <div class="flex justify-start">

                    <div>
                        <h1 class="text-2xl">
                            {{ keyToVictory.percent }}
                        </h1>
                        <p class="text-sm">of the remaining vote</p>
                    </div>

                    <div class="flex items-center px-10">
                        <h3 class="mx-auto text-xl">OR</h3>
                    </div>

                    <div>
                        <h1 class="text-2xl">
                            {{ keyToVictory.votesNeeded.toLocaleString() }}
                        </h1>
                        <p class="text-sm">votes of ~{{ keyToVictory.votesRemaining.toLocaleString() }} that remain.</p>
                    </div>
                </div>
            </div>

            <div v-else-if="keyToVictory.votesNeeded <= 0">
                <p class="my-1"><b class="font-header">Key To Victory:</b> It is mathematically impossible for <span class="text-white py-1 px-2 rounded-sm" :style="{backgroundColor: keyToVictory.color+'80'}">{{ keyToVictory.name }}</span> to lose.</p>
            </div>

            <div v-else>
                <p class="my-1"><b class="font-header">Key To Victory:</b> It is mathematically impossible for <span class="text-white py-1 px-2 rounded-sm" :style="{backgroundColor: keyToVictory.color+'80'}">{{ keyToVictory.name }}</span> to win.</p>
            </div>


        </div>

    </div>


</template>