import { Sequelize } from "sequelize";

const sequelize = new Sequelize('local_db', 'local_user', 'local_password', {
  host: 'localhost',
  dialect: 'postgres'
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been estabilished successfully.');
    await sequelize.sync();
    console.log("Database Synced")
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  };
};

export {
  connectDB
}