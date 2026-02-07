// src/models/index.js
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import Customer from './Customer.js';
import Equipment from './Equipment.js';

// Carregar variáveis de ambiente
config();

/**
 * Configuração e inicialização do Sequelize
 * Esta função retorna uma instância configurada do Sequelize
 * com todos os modelos carregados e associados
 */
export async function setupDatabase() {
  // Configuração da conexão com o banco de dados
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        underscored: true,
        timestamps: true
      }
    }
  );

  // Inicializar modelos
  Customer.init(sequelize);
  Equipment.init(sequelize);

  // Definir associações
  Customer.associate({ Equipment });
  Equipment.associate({ Customer });

  // Testar conexão e sincronizar modelos
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso!');
    
    // Sincronizar modelos com o banco (criar tabelas se não existirem)
    // force: false - não recria tabelas existentes
    // alter: true - atualiza tabelas existentes com novas colunas
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Modelos sincronizados com o banco de dados');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Erro ao conectar/sincronizar com o banco:', error.message);
    throw error;
  }
}

// Exportar modelos para uso em outros arquivos
export { Customer, Equipment };