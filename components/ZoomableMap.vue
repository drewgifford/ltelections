<script setup lang="ts">

    const props = defineProps<{
        race: Raw<Race>
    }>();

    import * as d3 from "d3";
    import * as topojson from "topojson-client";
import type Color from "~/server/types/Color";
    import type Race from "~/server/types/Race";
import { OfficeType } from "~/server/types/Race";
import ReportingUnit from "~/server/types/ReportingUnit";

    const elem = useTemplateRef("svg");
    const tooltip = useTemplateRef("tooltip");

    // Tooltip values
    let selectedRu = ref<Raw<ReportingUnit>>();

    let statePostal = props.race.state?.postalCode;

    async function populateMap(){

        let race = props.race;
        let officeType = race.officeID;

        let data: any;

        if(statePostal == "AK"){

            data = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=cds`);

            return [topojson.feature(data, data.objects.cds), null];
        }

        if(officeType == OfficeType.House){
            // Return congressional district with only the counties included in the reportingUnits

            data = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=cds-counties`);
            let obj = data.objects[`cd-${race.seatNum}`];

            delete data['bbox'];

            let countyIds: string[] = []
            race.reportingUnits.forEach(x => {
                countyIds.push(x.fipsCode || '');
            });

            obj.geometries = obj.geometries.filter((x: any) => {
                return countyIds.includes(String(x.id));
            });

            // State
            let stateData: any = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=cds`);
            let stateFeature: any = topojson.feature(stateData, stateData.objects.cds);
            

            return [topojson.feature(data, obj), stateFeature];

        } else {

            data = await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=counties`);
            

            return [topojson.feature(data, data.objects.counties), null];

        }

        return data;



    }

    let ruIdx = 0;
    

    onMounted(async () => {
        //const data: any = (await d3.json(`/api/topojson?postalCode=AL&mapType=1`));

        let [feature, stateFeature]: any = await populateMap();

        let features: any[] = feature.features;

        let projection = d3.geoAlbersUsa().scale(1).translate([0,0]);

        projection.fitExtent([[20,20],[elem.value?.clientWidth || 100, elem.value?.clientHeight || 200]], feature);



        let geoGenerator = d3.geoPath()
            .projection(projection);

        // TEST: add state behind house projection

        if(stateFeature) d3.select(elem.value).select("#background").selectAll('path').data(stateFeature.features).join('path').attr('d', geoGenerator).attr("fill", "#0F172A").attr("stroke", "#1E293B").attr("stroke-width", 0.75);
        
        var svg = d3.select(elem.value).select("#foreground").selectAll('path').data(features).join('path').attr('d', geoGenerator).attr("stroke", "#0C1325").attr("stroke-width", 0.75).attr("fill", function(county){
           let countyName = county.properties.name;

            let reportingUnit: ReportingUnit = props.race.reportingUnits.find(ru => ru.fipsCode == county.id);

            if(!reportingUnit) return "#00ffff";

            // Sort candidates by vote count
            
            let candidates = reportingUnit.candidates.sort((a,b) => (a.voteCount || 0) > (b.voteCount || 0) ? -1 : 1);

            let raceCand = props.race.candidates.find(cand => cand.polID == candidates[0].polID);

            if(!raceCand) return "#00ffff";

            let defaultColors: Color[] = ["#ffffff","#aaaaaa","#999999","#777777"]

            let colors = raceCand.partyData?.colors;
            if(!colors || colors.length < 4) colors = defaultColors;

            

            if (candidates.length == 1) return colors[0];

            let voteTotal = reportingUnit.parameters.vote?.total || 0;
            let vt = (voteTotal == 0 ? 1 : voteTotal);

            let cand1Vote = candidates[0].voteCount || 0;
            let cand2Vote = candidates[1] ? (candidates[1].voteCount || 0) : 0;

            let difference = ((cand1Vote-cand2Vote)/vt)*100;

            if(difference >= 15) { return colors[0]+'80' }
            else if (difference >= 7.5) { return colors[1]+'80' }
            else if (difference >= 2) { return colors[2]+'80' }
            else if (difference > 0) { return colors[3]+'80' }
            else return "#1E293B80";

            return ["#E7004A", "#E7004A", "#E7004A", "#E7004A", "#E7004A", "#cfaaa2", "#ffa9b6", "#ff0052", "#b2b8d1","#b2b8d1","#5f85ff", "#0041E9"][Math.floor(Math.random()*12)];

        });

        const mouseover = function(event: any, d: any){

            let t: HTMLDivElement = tooltip.value as HTMLDivElement;
            
            t.style.filter = 'opacity(1)';

            // Fill data
            let reportingUnit = props.race.reportingUnits.find(ru => ru.fipsCode == d.id);

            console.log(reportingUnit);
            if(reportingUnit){
                selectedRu.value = reportingUnit;
                ruIdx++;
            };


            
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

            console.log(tooltipBounds);

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

            <div v-if="(selectedRu)">

                <p class="text-white font-header mb-2">{{ selectedRu.reportingunitName }}</p>

                <ResultTable :key="ruIdx" :unit="selectedRu" :max="5" :reporting="true" class="w-80"/>

            </div>
        </div>

        <svg class="w-full" style="min-height: 500px;" ref="svg">
            <g id="background"></g>
            <g id="foreground"></g>
            
        </svg>
    </div>
                        
</template>