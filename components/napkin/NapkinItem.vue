<script lang="ts" setup>

const props = defineProps<{
  color: string,
}>();

</script>

<template>
  <div class="w-full flex gap-4">
    <div class="w-2 rounded-sm" :style="{backgroundColor: props.color}"></div>
    <slot></slot>
  </div>
</template>



<style>

</style>