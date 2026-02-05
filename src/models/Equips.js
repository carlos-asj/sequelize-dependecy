import { DataTypes } from "sequelize";

export const createEquipModel = async (sequelize) => {
    const Equip = sequelize.define('Equip', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'clients',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        serial_num : {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'equips',
        timestamps: true
    });

    Equip.associate = (models) => {
        Equip.belongsTo(models.Client, {
            foreignKey: 'client_id',
            as: 'client' // ← ALIAS correto
        });
    };

    Equip.findWithClient = async function(id) {
    return await this.findByPk(id, {
      include: [{
        model: sequelize.models.Client,
        as: 'client',
        attributes: ['id', 'name', 'cpf_cnpj']
      }]
    });
  };

    // Equip.getType = async function(type) {
    //     return await this.findAll({
    //         where: { type },
    //         include: [ 'client']
    //     });
    // };

    return Equip;
}