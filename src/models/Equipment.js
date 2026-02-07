// src/models/Equipment.js
import { Model, DataTypes } from 'sequelize';

/**
 * Modelo Equipment (Equipamento)
 * Representa um equipamento no sistema
 * 
 * Relacionamentos:
 * - Um equipamento pertence a um cliente (belongsTo)
 * - Campos obrigatórios: name, serial_num, customer_id
 */
export class Equipment extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'O nome do equipamento é obrigatório'
          },
          len: {
            args: [2, 100],
            msg: 'O nome deve ter entre 2 e 100 caracteres'
          }
        }
      },
      serial_num: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: 'serial_num_unique',
          msg: 'Este número de série já está em uso'
        },
        validate: {
          notEmpty: {
            msg: 'O número de série é obrigatório'
          }
        }
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        validate: {
          notNull: {
            msg: 'O cliente é obrigatório'
          }
        }
      }
    }, {
      sequelize,
      modelName: 'Equipment',
      tableName: 'equipments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ['serial_num']
        },
        {
          fields: ['customer_id']
        }
      ]
    });
  }

  /**
   * Define as associações do modelo
   */
  static associate(models) {
    // Um equipamento pertence a um cliente
    this.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });
  }
}

export default Equipment;