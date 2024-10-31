<script setup lang="ts">
import type Color from '~/server/types/Color';
import type Race from '~/server/types/Race';
import type { ReportingCandidate } from '~/server/types/ReportingUnit';
import { getPollingAverage } from '~/server/utils/PollingAverage';
import { getRaceProbabilities, hasProjectOMatic, roundPercentage } from '~/server/utils/RaceProbability';
import { getBlendedColor } from "~/server/utils/Util";

const props = defineProps<{
        race: Race,
        forceSmall: boolean
    }>();
const LOW_QUALITY_NEEDLE_RACES = ["AK", "VT", "CT", "ME", "RI", "NH", "MA"];

const projectomatic = computed(() => {

    let topProbabilities =  props.race.candidates.toSorted((a: any,b: any) => Number(a.probability) > Number(b.probability) ? -1 : 1);
    
    let leadingPct = getLeadingPct(topProbabilities);
    let colors = getColors(topProbabilities);
    let needleStyles = getNeedleStyles(topProbabilities);
    let needleGradient = getNeedleGradient(colors as Color[]);
    let leadingText = getLeadingText(topProbabilities, colors as Color[]);
    let needlePct = getNeedlePct(topProbabilities);

    return {
        leadingPct: leadingPct,
        needleStyles: needleStyles,
        leadingText: leadingText,
        needleGradient: needleGradient,
        colors: colors,
        needlePct: needlePct,
        candidate: topProbabilities[0],
    }
});

const getLeadingPct = (topProbabilities: ReportingCandidate[]) => {

    let leadingPct = roundPercentage(topProbabilities[0].probability as number, 2);
    if(props.race.raceCallStatus == "Called") leadingPct = "100%";

    return leadingPct;
}

const getNeedlePct = (topProbabilities: ReportingCandidate[]) => {

    let leadingPct = topProbabilities[0].probability as number*100;

    if(props.race.raceCallStatus == "Called") leadingPct = 100;

    return (leadingPct-50)*2;


}
    

const getNeedleStyles: any = (topProbabilities: ReportingCandidate[]) => {

    let low = 0.45;
    let high = 1.00;
    let pct = topProbabilities[0].probability as number;

    let progress = 0;
    if(pct < low) progress = 0;
    else if(pct > high) progress = 1;
    else {
        progress = (pct - low) / (high-low);
    }

    if(props.race.raceCallStatus == "Called") progress = 1;

    let rotation = -(progress * 90);

    

    let margin = (0.5 - progress * 0.5);

    return {
        'transform': `rotate(${Math.round(rotation)}deg)`,
        'bottom': `${margin}rem`
    };

}

const getColors = (topProbabilities: ReportingCandidate[]) => {

    let cands = topProbabilities;

    let cand1 = cands[0];
    let color1 = cand1?.partyData?.colors[0];

    let color2 = color1;
    if(cands.length > 0){
        let cand2 = cands[1];

        if(cand2){
            color2 = cand2?.partyData?.colors[0];
        }
    }

    if(!color1 || !color2) return [];

    let colors = [];
    for(let i = 0; i < 11; i++){
        colors.push(getBlendedColor(color1, color2, i/10));
    }

    return colors;
}

const getNeedleGradient = (colors: Color[]) => {

    let leftColor = colors[5]+'';
    let leftColorTransparent = colors[6]+'11';

    let rightColor = colors[9]+'';
    let rightColorTransparent = colors[10]+'11';
    

    return {
        'background-image': `linear-gradient(90deg, ${leftColorTransparent} 0%, ${leftColor} 5%, ${rightColor} 95%, ${rightColorTransparent} 100%)`
    }
}

const getLeadingText = (topProbabilities: ReportingCandidate[], colors: Color[]) => {


    let candidates = topProbabilities;

    let leader = candidates[0];

    let cand = candidates[0];
    let leadingPct = leader.probability as number;

    
    let text = "";
    let color = "#ffffff";

    if(!cand) {
        return {
            text: "An error has occurred.",
            color: color
        }
        
    };

    
    if(props.race.raceCallStatus == "Called"){
        text = `projected`;
        color = cand.partyData?.colors[0] as string;
    }
    else if(leadingPct > 0.95){
        text = `near certain`;
        color = colors[10];
    }
    else if(leadingPct > 0.8){
        text = `very likely`;
        color = colors[8];
    }
    else if(leadingPct > 0.6){
        text = `likely`;
        color = colors[7];
    }
    else {
        text = `slightly likely`;
        color = colors[5];
    }
    
    return {
        text: text,
        color: color
    }

}

const getTickClass = (n: number) =>{

    n = n + 49;

    if(n % 10 == 0){
        return ['tick','majorTick'];
    }
    else if(n % 5 == 0){
        return ['tick','midTick'];
    }
    else {
        return ['tick'];
    }


}

</script>


<template>

    <div class="pb-4 flex-1 relative" :style="{width: 'calc(100% - 1.5rem)'}">

        <div class="w-full">
            <h1 class="text-xl mt-1">{{ projectomatic.candidate.last }} is <span class="px-2 rounded-sm" :style="{backgroundColor: projectomatic.leadingText.color+'80'}">{{ projectomatic.leadingText.text }}</span> to win.</h1>

            <p class="mt-2">{{ projectomatic.candidate.fullName }} currently has a <span class="font-header">{{ projectomatic.leadingPct }}</span> chance of winning.</p>
            
        </div>

        <div class="relative hidden" :class="!props.forceSmall ? ['lg:block'] : []"> <!-- Desktop -->

            <div class="relative w-full mt-10 px-0">

                <div class="bar h-10 mt-4 rounded-sm" :style="projectomatic.needleGradient">
                    <div class="w-full h-full flex justify-between relative">
                        <!--Ticks-->
                        <div v-for="n in 51" class="relative" :class="getTickClass(n)"><span v-if="(n+49) % 5 == 0">{{ n+49 }}</span></div>

                    </div>
                    

                </div>
                <div class="flex justify-around !text-slate-600 font-header py-2 text-xs">
                    <span>P</span><span>R</span><span>O</span><span>J</span><span>E</span><span>C</span><span>T</span><span>O</span><span>M</span><span>A</span><span>T</span><span>I</span><span>C</span>
                </div>

                <div class="absolute top-0 left-0 pr-2 w-full h-full pointer-events-none">
                    <div class="w-full h-full relative">
                        <div class="absolute needle w-2 bg-white bottom-0" :style="{left: projectomatic.needlePct+'%'}">

                        </div>
                    </div>
                    
                </div>

                

            </div>

            <div class="w-full text-xs flex">
                    <div class="rounded-sm text-center py-1 mr-0.5" :style="{backgroundColor: projectomatic.colors[5]+'', width: '20%'}"><span class="font-header">Slightly Likely</span></div>
                    <div class="rounded-sm text-center py-1 ml-0.5 mr-0.5" :style="{backgroundColor: projectomatic.colors[6]+'', width: '40%'}"><span class="font-header">Likely</span></div>
                    <div class="rounded-sm text-center py-1 ml-0.5 mr-0.5" :style="{backgroundColor: projectomatic.colors[8]+'', width: '30%'}"><span class="font-header">Very Likely</span></div>
                    <div class="rounded-sm text-center py-1 ml-0.5" :style="{backgroundColor: projectomatic.colors[10]+'', width: '10%'}"><span class="font-header">Certain</span></div>
            </div>
        </div>



        <div class="relative overflow-x-hidden" :class="!props.forceSmall ? ['lg:hidden'] : []"> <!-- Mobile -->
            
            <div class="relative mt-10 px-0" :style="{width: '400%', left: (-projectomatic.needlePct*3.5 + 25)+'%'}">

                <div class="bar pb-6 h-20 mt-4 rounded-sm" :style="projectomatic.needleGradient">
                    <div class="w-full h-full flex justify-between relative">
                        <!--Ticks-->
                        <div v-for="n in 51" class="relative" :class="getTickClass(n)"><span v-if="(n+49) % 5 == 0">{{ n+49 }}</span></div>

                    </div>
                    

                </div>
                

                <div class="absolute top-0 left-0 w-full pr-2 h-full pointer-events-none">
                    <div class="w-full h-full relative">
                        <div class="shadow-md absolute needle w-2 bg-white bottom-0" :style="{left: projectomatic.needlePct+'%'}">

                        </div>
                    </div>
                    
                </div>

                

            </div>

            <div class="flex justify-around !text-slate-600 font-header py-2 text-xs">
                <span>P</span><span>R</span><span>O</span><span>J</span><span>E</span><span>C</span><span>T</span><span>O</span><span>M</span><span>A</span><span>T</span><span>I</span><span>C</span>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>

    .tick {
        height: 30%;
        top: calc(-30% / 1.5);
        width: 0.1rem;
        background-color: white;
        margin: 2.5px;
    }
    .tick.midTick {
        height: 50%;
    }
    .tick.majorTick {
        height: 75%;
    }
    .tick span {
        color: white;
        @apply text-xs relative;

        top: -25px;
        margin-left: -0.5em;
    }
    .tick:last-of-type span {
        margin-left: -0.9em;
    }
    .majorTick span {
        @apply text-sm
    }

    .needle {
        @apply origin-center;
        height: 100%;

        box-shadow: 0px -10px 10px 5px rgba(0,0,0,0.35);
    }
    .needle::after {
        content: "";
        width: 100%;
        aspect-ratio: 1 / 1;

        border-bottom: 0.5em solid white;
        border-left: 0.25em solid transparent;
        border-right: 0.25em solid transparent;

        position: absolute;
        top: -0.5em;
        left: 0;

        
    }

</style>