const { REDIS_HOST, REDIS_PORT } = require("./serverConfig");
const Redis = require("ioredis");

const redisConfig = {
  port: REDIS_PORT,
  host: REDIS_HOST,
  maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisConfig);

module.exports = redisConnection;
