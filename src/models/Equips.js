import { DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
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

    return Equip;
}