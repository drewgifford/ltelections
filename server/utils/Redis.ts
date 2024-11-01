import {createClient, RedisClientType} from "redis";

export function redisClient(){

    const runtimeConfig = useRuntimeConfig();
    return createClient({
        socket: {
            host: runtimeConfig.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
        password: process.env.REDIS_PASSWORD,
    }) as RedisClientType;

}