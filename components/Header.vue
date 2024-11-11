<script setup lang="ts">

const { data: data } = (await useFetch("/api/raceActive"));

const mobileOpen = ref(false);

const toggle = () => {
  mobileOpen.value = !mobileOpen.value;
}



</script>

<template>
  <div class="w-full backdrop-blur text-slate-200 bg-slate-900/75 h-20 flex items-center sticky top-0 z-20">

    <div class="flex flex-wrap items-center container mx-auto">

      <div class="flex-1 flex">
            <NuxtLink href="/"><NuxtImg 
                    src="/img/logo.png"
                    width=100
                    alt="Let's Talk Elections Logo"

                /></NuxtLink>

        <ul class="list-none items-center space-x-10 hidden lg:flex ">

            <li>
                
            </li>

            <li>
                <NuxtLink to="/">Home</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/results/2024/">Election Results <span v-if="(data?.racesActive)" class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header">LIVE</span></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/about">About</NuxtLink>
            </li>
            <li>
                <NuxtLink to="https://discord.gg/lte" target="_blank" class="flex items-center"> &nbsp;Discord</NuxtLink>
            </li>
            <li>
                <NuxtLink to="https://buymeacoffee.com/ltelections" target="_blank" class="flex items-center py-1 px-2 bg-lte-yellow hover:brightness-75 rounded-sm !text-slate-950 font-header">Donate</NuxtLink>
            </li>
        </ul>
      </div>

      <div>

        <NuxtImg
          src="/img/hamburger.svg" width="40px"
          class="cursor-pointer p-1 lg:hidden"
          v-on:click="toggle"
        />

      </div>
    </div>

    <div :class="(mobileOpen ? 'translate-y-0' : '-translate-y-full')" class="fixed top-0 z-20 bg-gradient-to-tr from-slate-950/95 to-slate-950/100 w-full py-12 block lg:hidden">
      <Container>
        <div class="flex">
          <div class="list-none items-center text-xl flex-1">

            <div class="py-3">
              <NuxtLink to="/">Home</NuxtLink>
            </div>
            <div class="py-3">
              <NuxtLink to="/results/2024/">Election Results <span v-if="(data?.racesActive)" class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header">LIVE</span></NuxtLink>
            </div>
            <div class="py-3">
              <NuxtLink to="/about">About</NuxtLink>
            </div>
            <div class="py-3">
              <NuxtLink to="https://discord.gg/lte" target="_blank" class="flex items-center"> &nbsp;Discord</NuxtLink>
            </div>
            <div class="py-3">
              <NuxtLink to="https://buymeacoffee.com/ltelections" target="_blank" class="flex items-center py-1 px-2 bg-lte-blue/25 hover:bg-lte-blue/50 rounded-sm">Donate</NuxtLink>
            </div>
          </div>

          <div>
            <span v-on:click="toggle" class="text-4xl p-4 cursor-pointer">&times;</span>
          </div>
        </div>
      </Container>



    </div>
  </div>
</template>

<style>

</style>