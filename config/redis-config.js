const Redis = require("ioredis");

const redis = new Redis({
  host: `${process.env.REDIS_HOST}`,
  port: process.env.REDIS_PORT,
  password: `${process.env.REDIS_PASSWORD}`,
});

exports.connect_redis_hit = async (key) => {
  try {
    let cacheHit = await redis.get(`${key}`);
    if (cacheHit) {
      cacheHit = JSON.parse(cacheHit);
      return { ...cacheHit, retrieve_from: "Cache", hit: true };
    }
  } catch (e) {
    console.log("Problem with uniqueness Redis Memory Cache Hit 😥");
  }
};

exports.connect_redis_miss = async (key, value) => {
  try {
    redis.set(`${key}`, JSON.stringify(value), "EX", process.env.REDIS_TTL);
    return { ...value, retrieve_from: "Database", hit: false };
  } catch (e) {
    console.log("Problem with uniqueness Redis Memory Cache Miss 😥");
  }
};
