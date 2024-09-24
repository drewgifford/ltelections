<script lang="ts" setup>
  import Race from '~/server/types/Race';

  const props = defineProps<{
    race: Race,
  }>();

  console.log(props.race);

  let r = new Race(props.race);

</script>

<template>
  <a class="race relative transition-colors">

    <!-- Pin Button -->
    <div @click="$emit('pin')" :class="[r ? 'bg-lte-yellow text-slate-950 hover:brightness-75' : 'bg-slate-900/75 hover:brightness-125']" class="absolute top-0 right-0 h-7 w-7 p-1 rounded-bl-md flex items-center justify-center hover:cursor-pointer ">
        <Icon :name="race ? 'pajamas:thumbtack-solid' : 'pajamas:thumbtack'"/>
    </div>

    <div @click="$emit('select')" class="card p-4 pl-6 hover:bg-slate-800 hover:cursor-pointer">
        <div class="absolute left-0 top-0 h-full w-2 bg-lte-yellow rounded-l-sm"></div>

        

        <div class="flex w-full justify-between items-start">
            <div class="flex-1">
                <h4 class="text-lg">{{ r.getTitle() }} <span class="live-bg text-slate-200 text-sm rounded-sm px-1 font-header relative bottom-px">LIVE</span></h4>
                <p class="text-sm">{{ r.getDescription() }}</p>
            </div>

            <div class="flex gap-2">

              <div class="w-80">
                
                <div class="flex w-full" v-for="candidate of r.candidates.slice(0, 2)">
                  <div :style="[{backgroundColor: candidate.party?.colors[0]}]" class="rounded-l-sm text-xs px-1 flex items-center font-header text-center">{{ candidate.partyData?.shorthand }}</div>

                  <div :style="[{backgroundColor: candidate.party?.colors[0] +'40'}]" class="flex flex-1 px-2 py-1 justify-between items-center rounded-r-sm">

                    <p class="text-sm text-slate-200">{{ candidate.last }}</p>

                    <div class="text-right">
                      <p class="text-sm text-slate-200"><span class="text-xs text-slate-200/50">{{ candidate.voteCount.toLocaleString() }}</span>&nbsp;{{ ((candidate.voteCount / r.parameters.vote?.total as number)*100).toFixed(2) }}%</p>
                    </div>
                  </div>
                </div>



              </div>

                <!--<div v-for="candidate in race.reportingUnits[0].candidates.slice(0,2)" class="flex w-32 bg-lte-red/75 rounded-sm gap-2 items-center pr-2">
                    <div class="relative">
                        <NuxtImg
                            src="/img/donald_trump.png"
                            alt=""
                            class="w-12 aspect-square"
                        />
                        <div class="absolute bottom-0 left-0 bg-lte-red px-1 rounded-tr-sm rounded-bl-sm shadow-inner">
                            <p class="font-header text-sm">R</p>
                        </div>
                    </div>
                    

                    <div class="text-right flex-1">
                        <h4 class="text-md">{{ (((candidate.voteCount / race.reportingUnits[0].totalVotes) * 100) || 0).toFixed(2) }}%</h4>
                        <p class="text-xs text-slate-200/75">{{ candidate.voteCount.toLocaleString() }}</p>
                    </div>
                    
                </div>-->
            </div>
        </div>

        <div class="flex gap-2 items-center mt-2">

            <div class="bg-slate-700 w-full h-1">
                <div class="h-full bg-slate-200" :style="{'width': race.reportingUnits[0].eevp + '%'}"></div>
            </div>

            <p class="text-xs text-nowrap">{{race.reportingUnits[0].eevp}}% reporting</p>
        </div>
    </div>

    </a>
</template>

