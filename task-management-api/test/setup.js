const sequelize = require('../src/config/database');
const { connectRedis, redisClient } = require('../src/config/redis');

beforeAll(async () => {
  await sequelize.authenticate();
  await connectRedis();
});

afterAll(async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }

  await sequelize.close();
});