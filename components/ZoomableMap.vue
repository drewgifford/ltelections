<script setup lang="ts">

    const props = defineProps<{
        statePostal: string,
        mapType: string,
        raceData: Race
    }>();

    import * as d3 from "d3";
    import * as topojson from "topojson-client";
import type Race from "~/server/Race";

    const elem = useTemplateRef("svg");

    onMounted(async () => {

        const data: any = (await d3.json(`/api/topojson?postalCode=${props.statePostal}&mapType=${props.mapType}`));

        let feature: any = topojson.feature(data, data.objects.counties);

        let features: any[] = feature.features;

        let projection = d3.geoAlbersUsa().scale(1).translate([0,0]);

        projection.fitExtent([[20,20],[elem.value?.clientWidth || 100, elem.value?.clientHeight || 200]], feature);

        let geoGenerator = d3.geoPath()
            .projection(projection);
        
        d3.select(elem.value).selectAll('path').data(features).join('path').attr('d', geoGenerator).attr("fill", function(d){

            console.log(d);

            return ["#E7004A", "#E7004A", "#E7004A", "#E7004A", "#E7004A", "#cfaaa2", "#ffa9b6", "#ff0052", "#b2b8d1","#b2b8d1","#5f85ff", "#0041E9"][Math.floor(Math.random()*12)];

        })

        

    });






</script>

<template>


    <svg class="w-full min-h-96" ref="svg"></svg>
                        
</template>