import { Sequelize, DataTypes } from 'sequelize';
import databaseConfig from '../../config/database.js';
import clientModel from './Clients.js';
import equipModel from './Equips.js';


const sequelize = new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    {
        host: databaseConfig.host,
        dialect: 'postgres',
        define:{
            freezeTableName: true
        }
    }
);

const Client = clientModel(sequelize, DataTypes);
const Equip = equipModel(sequelize, DataTypes);

console.log('🔍 Modelos após inicialização:');
console.log(`   Cliente.name: ${Client.name}`);
console.log(`   Equipamento.name: ${Equip.name}`);

Client.hasMany(Equip, {
    foreignKey: 'client_id',
    as: 'equips', // ← alias para Cliente.getEquipamentos()
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Equip.belongsTo(Client, {
    foreignKey: 'client_id',
    as: 'client',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

export {
    sequelize,
    Client,
    Equip,
    Sequelize
};

export default {
    sequelize,
    Sequelize,
    Client,
    Equip
}