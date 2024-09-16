<script setup lang="ts">

import * as d3 from "d3";

let props = defineProps<{
    svgUrl: string,
  }>();


let mapUrl = "~/assets/topojson/counties-10m.json";

import { Canvg } from "canvg";
import Panzoom from "@panzoom/panzoom"
const canvasRef = ref(null);
let v = null;

/*watch(canvasRef, async () => {
    const canvas: any = canvasRef.value;
    const ctx = canvas.getContext("2d");

    v = await Canvg.from(ctx, props.svgUrl);
    v.start();

    const pz = Panzoom(canvas, {
        maxScale: 5,
        minScale: 0.1
    })

    canvas.addEventListener('wheel', pz.zoomWithWheel)
})*/
  

</script>

<template>


    <canvas ref="canvasRef">

    </canvas>
                        
</template>