<script setup lang="ts">
import Container from '~/components/Container.vue';

type TeamMember = {

name: string,
imageUrl: string,
roles: string,
description?: string

}

const teamMembers: TeamMember[] = [
{
  name: "Alrock",
  roles: "Election Team",
  imageUrl: "/img/decisiondesk/alrock_result.webp"
},
{
  name: "Tom Rod",
  roles: "Election Team",
  imageUrl: "/img/decisiondesk/tomrod_result.webp"
},
{
  name: "Archambault",
  roles: "Election Team",
  imageUrl: "/img/decisiondesk/archambault_result.webp"
},
{
  name: "Ishy",
  roles: "Election Team",
  imageUrl: "/img/decisiondesk/ishy_result.webp"
},
{
  name: "Amelia",
  roles: "Election Team, Web Support",
  imageUrl: "/img/decisiondesk/2hats_result.webp"
},
{
  name: "Sunset Coda",
  roles: "Election Manager, Decision Desk, Graphic Designer",
  imageUrl: "/img/decisiondesk/sunsetcoda_result.webp"
},
{
  name: "Michael",
  roles: "Decision Desk",
  imageUrl: "/img/decisiondesk/michael_result.webp"
},
{
  name: "Python",
  roles: "Decision Desk",
  imageUrl: "/img/decisiondesk/python_result.webp"
},
{
  name: "Selina",
  roles: "Decision Desk",
  imageUrl: "/img/decisiondesk/selina_result.webp"
},
{
  name: "Aspect",
  roles: "Bot, API Developer",
  imageUrl: "/img/decisiondesk/aspect_result.webp"
},
{
  name: "Toadally",
  roles: "Lead Web Developer, Decision Desk",
  imageUrl: "/img/decisiondesk/toadally_result.webp"
},
{
  name: "SwiftlySalted",
  roles: "Web Developer, Decision Desk, Moderation Manager",
  imageUrl: "/img/decisiondesk/swiftlysalted_result.webp"
}
].sort((a,b) => a.roles.includes("Decision Desk") && !b.roles.includes("Decision Desk") ? -1 : (a.name > b.name ? 1 : -1));

</script>

<template>

    <Container>

        <div class="grid lg:grid-cols-2 gap-4 mt-4 mb-12">
            
            <div>
                <div class="max-w-prose">
                    <h1 class="text-2xl">Who We Are</h1>
                    <p>The LTE Elections team and Decision Desk consists of professionals with over a decade of experience working in political campaigns and politics, as well as students majoring in political science, statistics, and computer science. Our predictions are based on an analysis of polling data, historical trends, and other factors. Ultimately, however, all predictions are just our opinions.</p>
                </div>

                <div class="max-w-prose mt-12 mb-12">
                    <h1 class="text-2xl">LTElections Decision Desk</h1>
                    <p>The Decision Desk is responsible for tweaking the polling model, making predictions, and analyzing and calling races on election night. We try to be fast and accurate, attempting to beat out the AP and other news organizations while still maintaining full confidence in our projections.</p>
                </div>

                <div class="max-w-prose mt-12 mb-12">
                    <p><a href="https://discord.gg/lte" target="_blank" style="background-color: #7289da" class="py-4 px-8 inline-block my-2  rounded-sm text-xl font-header">Join Our Discord ➤</a></p>
                    <p>Join the Let's Talk Elections Discord to discuss American politics, engage in server-wide events, and enjoy live commentary on election nights.</p>
                
                </div>
            </div>

            <div>

                <div class="grid grid-cols-2 gap-4">

                    <div v-for="(member, index) in teamMembers" class="card p-4 flex items-center gap-4">
                        <img :src="member.imageUrl" class="w-20 h-20 rounded-sm"/>

                        <div>
                            <h3 class="text-2xl">{{ member.name }}</h3>
                            <p>{{ member.roles }}</p>
                        </div>
                    </div>
                    
                </div>

            </div>

        </div>
    </Container>

    

</template>