<script setup lang="ts">
import * as d3 from "d3";


onMounted(() => {

})

</script>

<template>
  <div class="flex gap-4 ml-auto justify-end absolute bottom-0 right-0 z-0 p-2 pointer-events-none">
    <div class="flex gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
          <pattern id="pattern-generic-dashed" patternUnits="userSpaceOnUse" width="8" height="8"><rect width="8" height="8" fill="#411C62"></rect><path d="M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4" stroke-width="3" stroke="#0C1325"></path></pattern>
          <rect id="Rectangle_1" data-name="Rectangle 1" width="25" height="25" rx="4" fill="url(#pattern-generic-dashed)"/>
        </svg>
      <p>Leading</p>
    </div>
    <div class="flex gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
        <rect id="Rectangle_1" data-name="Rectangle 1" width="25" height="25" rx="4" fill="#411C62"/>
      </svg>
      <p>Won</p>
    </div>
  </div>


</template>

<style scoped>

</style>