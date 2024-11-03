<script setup lang="ts">

  const error = useError();

</script>

<template>
  <Header></Header>
  <NuxtLayout>
    <Container>
      <div class="mt-12 max-w-prose mx-auto">
        <h1 class="text-4xl">{{ error.message }}</h1>
        <p class="mt-2">Unfortunately, an error has occurred. If you believe this be an error, please contact us by joining the Discord linked below.</p>
        <a href="https://discord.gg/lte" target="_blank" style="background-color: #7289da" class="hover:brightness-75 py-4 px-8 inline-block my-2  rounded-sm text-xl font-header">Join Our Discord ➤</a>
      </div>
    </Container>

  </NuxtLayout>
</template>

<style scoped>

</style>