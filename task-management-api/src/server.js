require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log('Database connected successfully');

    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      'Unable to start server:',
      error.message
    );

    process.exit(1);
  }
};

startServer();