import cron from "node-cron";
import axios from "axios";

export default defineNitroPlugin(async (nitroApp) => {

    // Schedule a cron job if this environment is in development
    const runtimeConfig = useRuntimeConfig();

    if(runtimeConfig.env.NODE_ENV == 'development'){
        cron.schedule("*/30 * * * * *", async () => {

            console.info("Updating API...");
            const response = await axios.get("/api/refreshAPI", {
                headers: {
                    Authorization: `Bearer ${runtimeConfig.env.LTE_API_KEY}`
                }
            });

            console.log(response.data);

        });
    }

});
