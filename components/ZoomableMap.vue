<script setup lang="ts">

    const props = defineProps<{
        mapType: string,
        race: Raw<Race>
    }>();

    import * as d3 from "d3";
    import * as topojson from "topojson-client";
import type Color from "~/server/types/Color";
    import type Race from "~/server/types/Race";
import type ReportingUnit from "~/server/types/ReportingUnit";

    const elem = useTemplateRef("svg");

    let statePostal = props.race.state?.postalCode;
    

    onMounted(async () => {

        //const data: any = (await d3.json(`/api/topojson?postalCode=${statePostal}&mapType=${props.mapType}`));
        const data: any = (await d3.json(`/api/topojson?postalCode=AL&mapType=1`));

        let feature: any = topojson.feature(data, data.objects.counties);

        let features: any[] = feature.features;

        let projection = d3.geoAlbersUsa().scale(1).translate([0,0]);

        projection.fitExtent([[20,20],[elem.value?.clientWidth || 100, elem.value?.clientHeight || 200]], feature);

        let geoGenerator = d3.geoPath()
            .projection(projection);

        console.log(props.race.reportingUnits);
        
        d3.select(elem.value).selectAll('path').data(features).join('path').attr('d', geoGenerator).attr("fill", function(county){
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
            let difference = ((candidates[0].voteCount || 0)/vt - (candidates[1].voteCount || 0)/vt)*100;

            if(difference >= 15) { console.log(`${countyName}: Safe ${candidates[0].first} ${candidates[0].last}`); return colors[0] }
            else if (difference >= 7.5) { console.log(`${countyName}: Likely ${candidates[0].first} ${candidates[0].last}`); return colors[1] }
            else if (difference >= 2) { console.log(`${countyName}: Lean ${candidates[0].first} ${candidates[0].last}`); return colors[2] }
            else { console.log(`${countyName}: Tilt ${candidates[0].first} ${candidates[0].last}`); return colors[3] };

            return ["#E7004A", "#E7004A", "#E7004A", "#E7004A", "#E7004A", "#cfaaa2", "#ffa9b6", "#ff0052", "#b2b8d1","#b2b8d1","#5f85ff", "#0041E9"][Math.floor(Math.random()*12)];

        })

        

    });






</script>

<template>


    <svg class="w-full min-h-96" ref="svg"></svg>
                        
</template>