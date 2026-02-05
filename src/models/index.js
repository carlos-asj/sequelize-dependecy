import sequelize from 'sequelize';
import databaseConfig from '../../config/database.js';
import Client from '../../src/models/Clients.js';
import Equip from '../../src/models/Equips.js';


const sequelize = new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    {
        host: databaseConfig.host,
        dialect: databaseConfig.dialect,
        logging: databaseConfig.logging,
        define: databaseConfig.define
    }
);

const Client = Client(sequelize);
const Equip = Equip(sequelize);

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

if (Client.associate) {
  Client.associate({ Client, Equip });
}
if (Equip.associate) {
  Equip.associate({ Client, Equip });
}

console.log('🔗 Associações definidas:');
console.log('   Cliente → Equipamento: ✅');
console.log('   Equipamento → Cliente: ✅');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connection established');
        await sequelize.sync();
        console.log('Syncronized tables');
    } catch(error) {
        console.error('Connection error:', error);
    }
})();

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