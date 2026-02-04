import { Sequelize } from "sequelize";
import { createClientModel } from "../src/models/Clients.js";
import { createEquipModel } from "../src/models/Equips.js";

const sequelize = new Sequelize('local_db', 'local_user', 'local_password', {
  host: 'localhost',
  dialect: 'postgres'
});

let ClientModel = null;
let EquipModel = null;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been estabilished successfully.');
    ClientModel = await createClientModel(sequelize);
    EquipModel = await createEquipModel(sequelize);
    await sequelize.sync();
    console.log("Database Synced")
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  };
};

export {
  connectDB,
  ClientModel,
  EquipModel
}