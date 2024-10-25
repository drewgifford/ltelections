<template>
  <div class="w-full backdrop-blur text-slate-200 bg-slate-900/75 h-20 flex items-center sticky top-0 z-20">

    <div class="flex flex-wrap items-center container mx-auto">

            <NuxtLink href="/"><NuxtImg 
                    src="/img/logo.png"
                    width=100
                    alt="Let's Talk Elections Logo"

                /></NuxtLink>

        <ul class="list-none flex items-center space-x-10">

            <li>
                
            </li>

            <li>
                <NuxtLink to="/">Home</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/results/2024/">Election Results <span class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header">LIVE</span></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/about">About</NuxtLink>
            </li>
            <li>
                <NuxtLink to="https://discord.gg/lte" target="_blank" class="flex items-center"> &nbsp;Discord</NuxtLink>
            </li>
        </ul>
    </div>
  </div>
</template>

<style>

</style>