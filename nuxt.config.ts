// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image', 'nuxt-socket-io', "@nuxtjs/seo", "@nuxt/icon", "@nuxtjs/robots"],

  site: {
    url: "https://ltelections.com",
    name: "LTElections",
    description: "Real-time elections reporting, predictions and analysis for the 2024 U.S. general election.",
    defaultLocale: "en"
  },

  app: {
    head: {
      title: "LTElections",
      meta: [
        { name: "description", content: "Real-time elections reporting, predictions, and analysis." }
      ]
    }
  },

  nitro: {

    vercel: {
      functions: {
        maxDuration: 30
      }
    },
    plugins: [
        "~/server/plugins/RedisConnection.ts"
    ]
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false
    }
  ],

  css: [
    '~/assets/fonts/OpenSauceSans.css',
    '~/assets/fonts/Manrope.css',
    '~/assets/css/style.css'
  ],

  
  tailwindcss: {
    configPath: "~/tailwind.config"
  },

  runtimeConfig: {
    env: {
      LTE_API_KEY: process.env.LTE_API_KEY,
      REDIS_HOST: process.env.REDIS_HOST,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_PORT: process.env.REDIS_PORT,
      ELECTION_DATE: process.env.ELECTION_DATE,
      TEST_DATA: process.env.TEST_DATA,
      CRON_SECRET: process.env.CRON_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    }
  }
  

  
})