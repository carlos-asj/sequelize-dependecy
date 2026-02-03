import { DataTypes } from "sequelize";

export const createClientModel = async (sequelize) => {
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

    Client.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        delete values.deletedAt;
        return values;
    };

    return Client;

}