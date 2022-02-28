import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error(`Redis Client Error ${err}`));

export const getRedisClient = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

export const clearCache = async (filter: any) => {
  const client = await getRedisClient();
  const keys = await client.keys(filter);
  if (keys.length > 0) {
    await client.del(keys);
  }
};
