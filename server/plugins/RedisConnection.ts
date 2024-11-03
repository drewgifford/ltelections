import cron from "node-cron";
import axios from "axios";
import {createClient, RedisClientType} from "redis";

export class RedisUtil {

    static connection: RedisClientType

    static getConnection(){
        return RedisUtil.connection;
    }
    static setConnection(connection: RedisClientType){
        RedisUtil.connection = connection;
    }
    static async connect(config: any){
        let redis = createClient(config) as RedisClientType;

        redis.on('error', err => console.warn('Redis Client Error', err));

        await redis.connect();

        console.info("Connected!");

        RedisUtil.setConnection(redis);
    }
}

export default defineNitroPlugin(async (nitroApp) => {

    const runtimeConfig = useRuntimeConfig();

    let config = {
        socket: {
            host: runtimeConfig.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
        password: process.env.REDIS_PASSWORD,
    }

    await RedisUtil.connect(config);

});
