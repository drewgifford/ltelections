<template>

    <Container class="mt-4">
        

    </Container>

    <Container>
        <div class="flex gap-6">
            
            <div class="flex flex-col gap-6 w-1/2">

                <form class="flex gap-4 p-4 card">
                    <div>
                        <label for="location">Location</label>
                        <div class="relative w-60">
                            <!--<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>-->

                            <select id="location" class="block w-full px-4 py-2 bg-slate-800 rounded-lg transition-all outline-none hover:bg-slate-700">
                                <option selected>Any</option>
                                <option>Alabama</option>
                                <option>Alaska</option>
                                <option>Arizona</option>
                                <option>Ohio</option>
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

                            <select id="location" class="block w-full px-4 py-2 bg-slate-800 rounded-lg transition-all outline-none hover:bg-slate-700">
                                <option selected>Any</option>
                                <option>President</option>
                                <option>House</option>
                                <option>Senate</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label for="location">Per Page</label>
                        <div class="relative w-30">
                            <!--<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>-->

                            <select id="location" class="block w-full px-4 py-2 bg-slate-800 rounded-lg transition-all outline-none hover:bg-slate-700">
                                <option selected>10</option>
                                <option>25</option>
                                <option>50</option>
                            </select>
                        </div>
                    </div>


                </form>

                <a class="race card p-4 pl-6 relative hover:bg-slate-800 hover:cursor-pointer">
                    <div class="absolute left-0 top-0 h-full w-2 bg-lte-yellow rounded-l-md"></div>

                    <div class="flex w-full justify-between">
                        <div>
                            <h3 class="text-2xl">Ohio - President <span class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header relative bottom-px">LIVE</span></h3>
                            <p>Presidential Race - Nov 5, 2024</p>
                        </div>

                        <div class="flex gap-2">
                            <div class="flex bg-lte-red/75 rounded-md gap-2 items-center pr-3">
                                <div>
                                    <NuxtImg
                                        src="/img/donald_trump.png"
                                        alt=""
                                        class="w-14 aspect-square"
                                    />
                                    <h1 class="text-4xl ml-3 text-white/50 hidden">R</h1>
                                </div>
                                

                                <div class="text-right">
                                    <h3 class="text-xl">50.5%</h3>
                                    <p class="text-sm text-slate-200/75">1,500,523</p>
                                </div>
                                
                            </div>

                            <div class="flex bg-lte-blue/25 rounded-md gap-2 items-center pr-3">
                                <NuxtImg
                                    src="/img/donald_trump.png"
                                    alt=""
                                    class="w-14 aspect-square"
                                />

                                <div class="text-right">
                                    <h3 class="text-xl">49.5%</h3>
                                    <p class="text-sm text-slate-200/75">1,451,743</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2 items-center mt-2">

                        <div class="bg-slate-700 w-full h-1">
                            <div class="w-1/2 h-full bg-slate-200"></div>
                        </div>

                        <p class="text-xs text-nowrap">50% reporting</p>
                    </div>
                    
                </a>
                <div class="race card p-4 pl-6 relative hover:bg-slate-800 hover:cursor-pointer">
                    <div class="absolute left-0 top-0 h-full w-2 bg-lte-blue/50 rounded-l-md"></div>

                    <div class="flex w-full justify-between">
                        <div>
                            <h3 class="text-2xl relative">Ohio - Senate <span class="bg-slate-200 font-header !text-slate-900 text-sm rounded-sm px-1 relative bottom-px">Forecast</span></h3>
                            <p>Presidential Race - Nov 5, 2024</p>
                        </div>

                        <div class="flex gap-2">
                            <div class="flex bg-lte-red/75 rounded-md gap-2 items-center pr-3">
                                <NuxtImg
                                    src="/img/donald_trump.png"
                                    alt=""
                                    class="w-14 aspect-square"
                                />

                                <div class="text-right">
                                    <h3 class="text-xl">50.5%</h3>
                                    <p class="text-sm text-slate-200/75">1,500,523</p>
                                </div>
                                
                            </div>

                            <div class="flex bg-lte-blue/25 rounded-md gap-2 items-center pr-3">
                                <NuxtImg
                                    src="/img/donald_trump.png"
                                    alt=""
                                    class="w-14 aspect-square"
                                />

                                <div class="text-right">
                                    <h3 class="text-xl">49.5%</h3>
                                    <p class="text-sm text-slate-200/75">1,451,743</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2 items-center mt-2">

                        <div class="bg-slate-700 w-full h-1">
                            <div class="w-1/2 h-full bg-slate-200"></div>
                        </div>

                        <p class="text-xs text-nowrap">15 days</p>
                    </div>
                    
                </div>

            </div>

            <div class="w-1/2">
                
                <div class="card">
                    <CandidateBattle/>

                    <div class="p-4">
                        <p>Ohio > President</p>
                        <h3 class="text-2xl mb-4">Donald Trump is leading Kamala Harris in Ohio.</h3>
                        <a class="bg-lte-yellow px-4 py-2 text-slate-900 rounded-lg" href="/">See Detailed Results</a>
                    </div>
                    <div class="bg-slate-950/25 p-4 rounded-md shadow-inner">
                        <img class="mx-auto" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Ohio_Presidential_Election_Results_2020.svg/500px-Ohio_Presidential_Election_Results_2020.svg.png"/>
                        <p class="px-4 text-right">Last updated 11/5/2024 at 8:25PM EST</p>
                    </div>
                </div>
            </div>

            


        </div>
        

        

    </Container>

</template>