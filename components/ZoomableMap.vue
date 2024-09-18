<script setup lang="ts">

    import * as d3 from "d3";
    import * as topojsonClient from "topojson-client";

    const elem = useTemplateRef("svg");

    onMounted(async () => {

        const data: any = (await d3.json("/api/topojson?postalCode=OH&mapType=counties"));



        let features = Object.keys(data.objects).map((key) => {

            let obj = data.objects[key];

            return topojsonClient.feature(data, obj);

        })
        console.log(features);

        let projection = d3.geoAlbersUsa().scale(1).translate([0,0]);

        projection.fitExtent([[20,20],[elem.value?.clientWidth || 100, elem.value?.clientHeight || 200]], features[0]);

        let geoGenerator = d3.geoPath()
            .projection(projection);
        
        d3.select(elem.value).selectAll('path').data(features).join('path').attr('d', geoGenerator);

        

    });






</script>

<template>


    <svg class="w-full min-h-60" ref="svg"></svg>
                        
</template>