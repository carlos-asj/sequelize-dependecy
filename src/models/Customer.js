// src/models/Customer.js
import { Model, DataTypes } from 'sequelize';

/**
 * Modelo Customer (Cliente)
 * Representa um cliente no sistema
 * 
 * Relacionamentos:
 * - Um cliente pode ter vários equipamentos (hasMany)
 * - Campos obrigatórios: name, cpf_cnpj
 */
export class Customer extends Model {
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
            msg: 'O nome do cliente é obrigatório'
          },
          len: {
            args: [3, 100],
            msg: 'O nome deve ter entre 3 e 100 caracteres'
          }
        }
      },
      cpf_cnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'O CPF/CNPJ é obrigatório'
          },
          len: {
            args: [11, 18],
            msg: 'CPF/CNPJ deve ter entre 11 e 18 caracteres'
          }
        }
      }
    }, {
      sequelize,
      modelName: 'Customer',
      tableName: 'customers',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: false
    });
  }

  /**
   * Define as associações do modelo
   */
  static associate(models) {
    // Um cliente pode ter vários equipamentos
    this.hasMany(models.Equipment, {
      foreignKey: 'customer_id',
      as: 'equipments'
    });
  }
}

export default Customer;