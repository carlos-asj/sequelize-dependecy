import { DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        cpf_cnpj : {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'clients',
        timestamps: true,
        scopes: {
            withEquips: {
                include: ['equips']
            }
        }
    });
    return Client;
};

