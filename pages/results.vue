<template>

    <Container>
        <form class="flex gap-4">
            <div>
                <label for="location">Location</label>
                <div class="relative w-60">
                    <!--<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>-->

                    <select id="location" class="block w-full px-4 py-2 bg-slate-800/25 rounded-lg transition-all outline-none hover:bg-slate-700/25 focus:bg-slate-600/25">
                        <option selected>National</option>
                        <option>Alabama</option>
                        <option>Alaska</option>
                        <option>Arizona</option>
                    </select>
                </div>
            </div>

            <div>
                <label for="location">Race Type</label>
                <div class="relative w-60">
                    <!--<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>-->

                    <select id="location" class="block w-full px-4 py-2 bg-slate-800/25 rounded-lg transition-all outline-none hover:bg-slate-700/25 focus:bg-slate-600/25">
                        <option selected>President</option>
                        <option>House</option>
                        <option>Senate</option>
                    </select>
                </div>
            </div>


        </form>

    </Container>

    <Container>

        <div class="race card p-4 w-1/2">
            <div class="flex w-full">
                <div>
                    <h3 class="text-2xl">Ohio - President <span class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header relative bottom-px">LIVE</span></h3>
                    <p>Presidential Race - Nov 5, 2024</p>
                </div>

                <div class="justify-self-end">
                    <div class="flex bg-lte-red/50 rounded-lg gap-2 items-center pr-3">
                        <NuxtImg
                            src="/img/donald_trump.png"
                            alt=""
                            class="w-14 aspect-square"
                        />

                        <div class="text-right">
                            <h3 class="text-xl">50.5%</h3>
                            <p class="text-sm">1,500,523</p>
                        </div>
                        
                    </div>

                    <div class="flex bg-lte-blue/50 rounded-lg gap-2 items-center pr-3">
                        <NuxtImg
                            src="/img/donald_trump.png"
                            alt=""
                            class="w-14 aspect-square"
                        />

                        <div class="text-right">
                            <h3 class="text-xl">49.5%</h3>
                            <p class="text-sm">1,451,743</p>
                        </div>
                        
                    </div>
                </div>
            </div>

            <div class="flex gap-2 items-center">

                <div class="bg-slate-700 w-full h-1">
                    <div class="w-1/2 h-full bg-slate-200"></div>
                </div>

                <p class="text-xs text-nowrap">50% reporting</p>
            </div>
            
        </div>

    </Container>

</template>