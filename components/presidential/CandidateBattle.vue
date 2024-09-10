<template>
  
  <div class="min-h-10 w-full flex justify-between">
            
      <div class="flex justify-between w-full">

        <!-- Candidate 1 -->
        <div class="flex justify-start space-x-1 text-left">
          <div class="py-2 self-center">

            <NuxtImg
              src="/img/donald_trump.png"
              width="125"
              height="125"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />

            

          </div>

          <div class="py-2 self-center">
              <p class="text-slate-200">Donald Trump</p>
              <h1 class="text-3xl">328</h1>
              <h3 class="text-md">50.5%</h3>
            </div>
        </div>


        <div class="py-2 self-end text-center text-slate-200">

          <p class="text-md">Electoral Votes</p>
          <p class="text-md mt-1.5">Polling Average</p>

        </div>

        <!-- Candidate 2 -->
        <div class="flex justify-start space-x-1 text-right">

          <div class="py-2 self-center">
              <p class="text-slate-200">Kamala Harris</p>
              <h1 class="text-3xl">210</h1>
              <h3 class="text-md">41.5%</h3>
            </div>

          <div class="py-2 self-center">

            <NuxtImg
              src="/img/donald_trump.png"
              width="125"
              height="125"
              alt=""
              class="-mt-8 self-end aspect-square object-cover object-top"
            />

          </div>
          
        </div>

      </div>


  </div>

  <div class="bg-slate-800 overflow-hidden h-2 relative">

    <div class="block h-2 absolute left-0 bg-lte-red" style="width: 50.5%"></div>
    <div class="block h-2 absolute right-0 bg-lte-blue" style="width: 41.5%"></div>

  </div>


</template>

<style>

</style>