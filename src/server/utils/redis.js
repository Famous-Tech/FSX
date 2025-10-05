import { createClient } from 'redis';

const redis = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379
    }
});

redis.on('error', (err) => {
    console.error(`REDIS DATABASE ERROR: ${err}`);
});

redis.on('connect', () => {
    console.log('REDIS CONNECTED SUCCESSFULLY');
});

(async () => {
    try {
        await redis.connect();
    } catch (err) {
        console.error(' Redis connection failed:', err);
    }
})();

export default redis;
