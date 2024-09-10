// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image'],
  app: {
    head: {
      title: "Let's Talk Elections",
      meta: [
        { name: "description", content: "Real-time elections reporting, predictions, and analysis." }
      ]
    }
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false
    }
  ],

  css: [
    '~/assets/fonts/OpenSauceSans.css',
    '~/assets/css/style.css'
  ],

  
  tailwindcss: {
    configPath: "~/tailwind.config"
  }
})