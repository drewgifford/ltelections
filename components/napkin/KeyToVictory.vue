<script setup lang="ts">
import { roundPercentage } from '~/server/utils/RaceProbability';
import type {Candidate, Race} from "~/server/types/ViewModel";
import OfficeType from "~/server/types/enum/OfficeType";

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
    }

    
    let incumbentCand = props.race.incumbents.length > 0 ? props.race.incumbents[0] : null;

    let incumbentCandSameParty = props.race.candidates.find(x => {
      return x.party.partyID == incumbentCand?.party.partyID && props.race.results[x.polID].probability > 0.05
    });

    if(props.race.lastWinningParty || incumbentCand){
        let incumbentParty = props.race.lastWinningParty;

        

        if(incumbentParty){

            let cand1 = props.race.candidates.find(x => x.party.partyID == incumbentParty) || null;
            let cand2;
            if(cand1) cand2 = props.race.candidates.find(x => x.polID != cand1.polID) || null;

            if(cand1 && cand2){
                cand = cand1;
                otherCand = cand2;
            }
        }
        else if (incumbentCandSameParty){

            let cand1 = incumbentCandSameParty;
            let cand2;
            if(cand1) cand2 = props.race.candidates.find(x => x.polID != cand1.polID) || null;

            if(cand1 && cand2){
                cand = cand1;
                otherCand = cand2;
            }

        }
    }

    if(props.race.officeID == OfficeType.BallotMeasure){
        cand = props.race.candidates.find(x => x.party.partyID == 'Yes') as Candidate;
        otherCand = props.race.candidates.find(x => x.party.partyID == 'No') as Candidate;
    }

    if(!otherCand) return null;

    let candVote = props.race.results[cand.polID].vote;
    let otherVote = props.race.results[otherCand.polID].vote;

    let gap = candVote - otherVote;



    let expectedVotes = props.race.expectedVotes;
    let votesRemaining = expectedVotes - props.race.totalVotes;

    let div = 2;
    if(props.race.winThreshold){
      console.log(props.race.winThreshold);
    }

    let needed = (votesRemaining - gap)/2;
    let percent = needed/votesRemaining;


    return {
        percent: roundPercentage(percent),
        votesRemaining: votesRemaining,
        votesNeeded: (Math.ceil(needed)),
        color: (cand.party.colors[0]),
        name: `${cand.fullName}`
    };


});

</script>

<template>

    <div v-if="race.officeID != OfficeType.BallotMeasure && keyToVictory" class="flex gap-4 my-4">

        <div class="w-2 rounded-sm" :style="{backgroundColor: keyToVictory.color}"></div>

        <div class="flex-1">

            <div v-if="(keyToVictory.votesNeeded > 0 && keyToVictory.votesNeeded <= keyToVictory.votesRemaining)">
                <p class="my-1 text-center md:text-left"><b class="font-header">Key To Victory:</b> To win, <span class="text-white py-1 px-2 rounded-sm" :style="{backgroundColor: keyToVictory.color+'80'}">{{ keyToVictory.name }}</span> needs:</p>
                
                <div class="md:flex justify-start">

                    <div class="md:block hidden">
                        <h1 class="text-2xl">
                            {{ keyToVictory.percent }}
                        </h1>
                        <p class="text-sm">of the remaining vote</p>
                    </div>

                    <div class="md:flex hidden items-center px-10">
                        <h3 class="mx-auto text-xl">OR</h3>
                    </div>

                    <div class="text-center md:text-left">
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