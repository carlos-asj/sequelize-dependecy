// src/routes/api.js
import { Router } from 'express';
import { Customer, Equipment } from '../models/index.js';

const router = Router();

router.get('/equipments', async (req, res, next) => {
  try {
    const equipments = await Equipment.findAll({
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'cpf_cnpj'] // Seleciona apenas campos necessários
      }],
      order: [['id', 'ASC']]
    });

    res.json({
      success: true,
      count: equipments.length,
      data: equipments
    });
  } catch (error) {
    next(error);
  }
});

router.get('/customers', async (req, res, next) => {
  try {
    const customers = await Customer.findAll({
      attributes: ['id', 'name', 'cpf_cnpj', 'created_at', 'updated_at'],
      order: [['id', 'ASC']]
    });

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    next(error);
  }
});

router.post('/customers', async (req, res, next) => {
  try {
    const { name, cpf_cnpj } = req.body;

    // Validação básica
    if (!name || !cpf_cnpj) {
      return res.status(400).json({
        success: false,
        error: 'Nome e CPF/CNPJ são obrigatórios'
      });
    }

    // Criar cliente
    const customer = await Customer.create({
      name: name.trim(),
      cpf_cnpj: cpf_cnpj.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: {
        id: customer.id,
        name: customer.name,
        cpf_cnpj: customer.cpf_cnpj,
        created_at: customer.created_at
      }
    });
  } catch (error) {
    // Tratamento de erros específicos do Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Este CPF/CNPJ já está cadastrado'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }
    
    next(error);
  }
});

router.post('/equipments', async (req, res, next) => {
  try {
    const { name, serial_num, customer_id } = req.body;

    // Validação básica
    if (!name || !serial_num || !customer_id) {
      return res.status(400).json({
        success: false,
        error: 'Nome, número de série e ID do cliente são obrigatórios'
      });
    }

    // Verificar se o cliente existe
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Criar equipamento
    const equipment = await Equipment.create({
      name: name.trim(),
      serial_num: serial_num.trim(),
      customer_id: parseInt(customer_id)
    });

    res.status(201).json({
      success: true,
      message: 'Equipamento criado com sucesso',
      data: {
        id: equipment.id,
        name: equipment.name,
        serial_num: equipment.serial_num,
        customer_id: equipment.customer_id,
        created_at: equipment.created_at
      }
    });
  } catch (error) {
    // Tratamento de erros específicos do Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Este número de série já está em uso'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Cliente inválido ou não encontrado'
      });
    }
    
    next(error);
  }
});

export default router;