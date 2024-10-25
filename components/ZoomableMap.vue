<script setup lang="ts">

    const props = defineProps<{
        race: Race,
        minHeight: string,
    }>();

    import * as d3 from "d3";
    import * as topojson from "topojson-client";
import type Color from "~/server/types/Color";
    import type Race from "~/server/types/Race";
import { OfficeType } from "~/server/types/Race";
import ReportingUnit from "~/server/types/ReportingUnit";
import LoadingSection from "./LoadingSection.vue";
    import { getBlendedMapColor } from "~/server/utils/Util";

    const elem = useTemplateRef("svg");
    const tooltip = useTemplateRef("tooltip");

    const NEW_ENGLAND_STATES = ["VT", "CT", "ME", "RI", "NH", "MA"];

    const INVALID_FILL = "#1E293B";
    const BG_FILL = "#0F172A";
    const BG_STROKE = "#0C1325";

    // Tooltip values
    let selectedRu = ref<ReportingUnit>();

    let statePostal = props.race.state?.postalCode;

    async function updateTooltipData(race: Race){
        if(selectedRu){
            selectedRu.value = race.reportingUnits.find(x => x.fipsCode == selectedRu.value?.fipsCode);
        }
    }

    async function updateMapColors(race: Race, elements: any){
        elements.attr("fill", (county: any) => {

            let reportingUnit;

            if(["AK","DC"].includes(props.race.state?.postalCode as string)){
                reportingUnit = race.reportingUnits[0];
            }
            else {
                reportingUnit = race.reportingUnits.find(ru => ru.fipsCode == county.id || (county.properties.COUSUBFP && ru.townFIPSCode == county.properties.COUSUBFP));
            }

            if(!reportingUnit) return INVALID_FILL;

            let candidates = reportingUnit.candidates.sort((a,b) => (a.voteCount || 0) > (b.voteCount || 0) ? -1 : 1);

            let raceCand = props.race.candidates.find(cand => cand.polID == candidates[0].polID);

            if(!raceCand) return INVALID_FILL;

            let defaultColors: Color[] = ["#ffffff","#aaaaaa","#999999","#777777"]

            let colors = raceCand.partyData?.colors;
            if(!colors || colors.length < 4) colors = defaultColors;



            if (candidates.length == 1) return colors[0];

            let voteTotal = reportingUnit.parameters.vote?.total || 0;
            let vt = (voteTotal == 0 ? 1 : voteTotal);

            let cand1Vote = candidates[0].voteCount || 0;
            let cand2Vote = candidates[1] ? (candidates[1].voteCount || 0) : 0;

            let difference = ((cand1Vote-cand2Vote)/vt)*100;

            function getDifferenceNumber(){
                if(difference >= 15) { return 0 }
                else if (difference >= 7.5) { return 1 }
                else if (difference >= 2) { return 2 }
                else if (difference > 0) { return 3 }
                else return 3;
            }

            

            let expectedVoteTotal = reportingUnit.parameters.vote?.expected.actual;

            if((cand1Vote - cand2Vote) >= ((expectedVoteTotal || 0) - voteTotal)) {
                // If the current number of outstanding votes is greater than the margin between the top two candidates, this county can be solid
                return `${colors[getDifferenceNumber()]}`
            }

            // If the candidate hasn't reached over 50% of the expected vote
            return `url(#pattern-${raceCand.party}-${getDifferenceNumber()})`


        });
    }

    async function populateMap(){

        let race = props.race;
        let officeType = race.officeID;
        

        let data: any;

        if(statePostal == "AK"){

            data = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=cds`);

            return [topojson.feature(data, data.objects.cds), null];
        }

        if(officeType == OfficeType.House || (race.seatNum && officeType == OfficeType.President)){
            // Return congressional district with only the counties included in the reportingUnits

            data = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=cds-counties`);

            let obj = data.objects[`cd-${race.seatNum}`];

            delete data['bbox'];

            let countyIds: string[] = []
            race.reportingUnits.forEach(x => {
                countyIds.push(x.fipsCode || '');
            });

            if(!NEW_ENGLAND_STATES.includes(race.state?.postalCode || '')){

                obj.geometries = obj.geometries.filter((x: any) => {
                    return countyIds.includes(String(x.id)) || (props.race.reportingUnits.find(ru => ru.reportingunitName == x.properties.name));
                });
            }

            // State
            let stateData: any = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=cds`);
            let stateFeature: any = topojson.feature(stateData, stateData.objects.cds);
            
            return [topojson.feature(data, obj), stateFeature];

        } else {

            data = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=counties`);
            data.objects.counties.geometries = data.objects.counties.geometries.filter((x: any) => {
                if (NEW_ENGLAND_STATES.includes(race.state?.postalCode || '')){
                    return Number(x.properties.COUSUBFP) != 0;
                }
                return true;
            });

            return [topojson.feature(data, data.objects.counties), null];

        }

        return data;



    }

    let ruIdx = 0;
    const loading = ref(true);

    
    

    onMounted(async () => {
        
        //const data: any = (await d3.json(`/api/topojson?postalCode=AL&mapType=1`));

        let [feature, stateFeature]: any = await populateMap();

        let features: any[] = feature.features;

        let projection = d3.geoAlbersUsa().scale(1).translate([0,0]);

        projection.fitExtent([[20,20],[elem.value?.clientWidth || 100, elem.value?.clientHeight || 200]], feature);



        let geoGenerator: any = d3.geoPath()
            .projection(projection);

        // TEST: add state behind house projection

        if(stateFeature) d3.select(elem.value).select("#background").selectAll('path').data(stateFeature.features).join('path').attr('d', geoGenerator).attr("fill", BG_FILL).attr("stroke", BG_STROKE).attr("stroke-width", 1);
        let defs = d3.select(elem.value).append("defs");
        var svg = d3.select(elem.value).select("#foreground").selectAll('path').data(features).join('path').attr('d', geoGenerator).attr("stroke","#0C1325").attr("stroke-width", 0.75);

        let parties: any[] = [];
        
        for(let candidate of props.race.candidates){
            if(parties.includes(candidate.party)) continue;

            parties.push(candidate.party);

            for(let i = 0; i < (candidate.partyData?.colors.length || 0); i++){
                let pattern = defs.append("pattern")
                    .attr('id',`pattern-${candidate.party}-${i}`).attr('patternUnits', 'userSpaceOnUse').attr("width","8").attr("height","8");

                pattern.append("rect").attr("width","8").attr("height","8").attr("fill", (candidate.partyData?.colors[i] as string)+'70');
                pattern.append("path").attr("d","M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4")
                    .attr("stroke-width", "1.5")
                    .attr("stroke", (candidate.partyData?.colors[i] as string)+'aa');
            }

            
        }

        watch(() => props.race, async (race) => {
            await updateMapColors(race, svg);
            await updateTooltipData(race);
        });
        await updateMapColors(props.race, svg);

        loading.value = false;

        const mouseover = function(event: any, d: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;

            // Fill data
            let reportingUnit;

            if(["AK","DC"].includes(props.race.state?.postalCode as string)){
                reportingUnit = props.race.reportingUnits[0];
            }
            else {
                reportingUnit = d ? props.race.reportingUnits.find(ru => ru.fipsCode == d.id || (d.properties.COUSUBFP && ru.townFIPSCode == d.properties.COUSUBFP)) : null;
            }
            
            selectedRu.value = reportingUnit || undefined;
            if(selectedRu.value){
                t.style.filter = 'opacity(1)';
            }
            ruIdx++;


            
            d3.select(this).attr('stroke', 'white').attr("stroke-width", 1.5).raise();
        }

        const mousemove = function(event: any, d: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;
            let x = event.offsetX;
            let y = event.offsetY;

            

            // Fix tooltip if it's clipping outside boundaries

            if(!elem.value) return;

            let svgBounds = elem.value.getBoundingClientRect();
            let tooltipBounds = t.getBoundingClientRect();

            let xOffset = 20;
            let yOffset = 0;

            if(x + svgBounds.x + tooltipBounds.width + 20 > window.innerWidth){
                // Clip to left side instead
                xOffset = -20 - tooltipBounds.width;
            }

            if(y + svgBounds.y + tooltipBounds.height + 40 > window.innerHeight){
                yOffset = -20 - tooltipBounds.height;
            }


            t.style.left = `${x+xOffset}px`;
            t.style.top = `${y+yOffset}px`;

        }

        const mouseleave = function(d: any){
            tooltip.value.style.filter = 'opacity(0)';

            
            d3.select(this).attr('stroke', '#0C1325').attr("stroke-width", 0.75).lower();
        }

        svg
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        

    });

</script>

<template>

    <div class="relative">

        <div class="overflow-x-auto rounded-sm absolute top-0 left-0 bg-slate-900/90 px-4 py-2 min-w-80 shadow-lg pointer-events-none !duration-0" style="filter: opacity(0)" ref="tooltip">

            <div v-for="ru in [selectedRu]" v-if="selectedRu" :key="(selectedRu.statePostal || '' in NEW_ENGLAND_STATES ? selectedRu.townFIPSCode : selectedRu?.fipsCode)">

                <p class="text-white font-header mb-2">{{ ru.reportingunitName }}</p>
                <ResultTable :key="ruIdx" :unit="ru" :max="5" :reporting="true"/>

            </div>
        </div>

        <svg class="w-full" ref="svg" :style="(loading ? {filter: 'opacity(0)', minHeight: `${props.minHeight}`} : {minHeight: `${props.minHeight}`})">
            <g id="background"></g>
            <g id="foreground"></g>
            
        </svg>

        <LoadingSection v-if="loading" :absolute=true :style="{minHeight: `${props.minHeight}`}"/>
    </div>

    
                        
</template>