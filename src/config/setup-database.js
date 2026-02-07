// setup-database.js
import pkg from 'pg';
import { config } from 'dotenv';

const { Client } = pkg; //

async function setupDatabase() {
  console.log('\n🚀 CONFIGURAÇÃO DO BANCO DE DADOS\n');
  console.log('📋 Configuração usada:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Porta: ${process.env.DB_PORT}`);
  console.log(`   Banco: ${process.env.DB_NAME}`);
  console.log(`   Usuário: ${process.env.DB_USER}`);
  console.log(`   Senha: ${process.env.DB_PASSWORD}`);

  // Usar valores padrão se necessário
  const DB_HOST = process.env.DB_HOST;
  const DB_PORT = process.env.DB_PORT;
  const DB_NAME = process.env.DB_NAME;
  const DB_USER = process.env.DB_USER;
  const DB_PASSWORD = process.env.DB_PASSWORD;
  const POSTGRES_PASSWORD = process.env.DB_PASSWORD;

  console.log('1. Conectando como usuário postgres...');
  
  const adminClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: 'postgres',
    password: POSTGRES_PASSWORD
  });

  try {
    await adminClient.connect();
    console.log('✅ Conectado ao PostgreSQL\n');

    // 2. Criar usuário
    console.log('2. Criando usuário da aplicação...');
    try {
      await adminClient.query(`
        CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}'
      `);
      console.log(`✅ Usuário '${DB_USER}' criado`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Usuário '${DB_USER}' já existe`);
      } else {
        console.log(`⚠️  ${error.message}`);
      }
    }

    // 3. Criar banco
    console.log('\n3. Criando banco de dados...');
    try {
      await adminClient.query(`
        CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}
      `);
      console.log(`✅ Banco '${DB_NAME}' criado`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Banco '${DB_NAME}' já existe`);
      } else {
        console.log(`⚠️  ${error.message}`);
      }
    }

    // 4. Conceder permissões
    console.log('\n4. Concedendo permissões...');
    try {
      await adminClient.query(`
        GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER}
      `);
      console.log('✅ Permissões concedidas');
    } catch (error) {
      console.log(`⚠️  ${error.message}`);
    }

    await adminClient.end();

    // 5. Conectar como usuário da aplicação
    console.log('\n5. Conectando como usuário da aplicação...');
    
    const appClient = new Client({
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD
    });

    try {
      await appClient.connect();
      console.log('✅ Conectado como usuário da aplicação\n');

      // 6. Criar tabelas
      console.log('6. Criando tabelas...');

      // Tabela customers
      await appClient.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela "customers" criada');

      // Tabela equipments
      await appClient.query(`
        CREATE TABLE IF NOT EXISTS equipments (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          serial_num VARCHAR(255) UNIQUE NOT NULL,
          customer_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_customer 
            FOREIGN KEY (customer_id) 
            REFERENCES customers(id)
        )
      `);
      console.log('✅ Tabela "equipments" criada');

      // Índice
      await appClient.query(`
        CREATE INDEX IF NOT EXISTS idx_equipments_customer_id 
        ON equipments(customer_id)
      `);
      console.log('✅ Índice criado');

      await appClient.end();

      console.log('\n✨✨✨ CONFIGURAÇÃO CONCLUÍDA! ✨✨✨\n');
      console.log('🚀 Agora execute: npm start');

    } catch (error) {
      console.log(`⚠️  Erro ao conectar como usuário da aplicação: ${error.message}`);
      console.log('💡 As tabelas serão criadas quando a aplicação iniciar.');
    }

  } catch (error) {
    console.error(`\n❌ ERRO: ${error.message}`);
    
    console.log('\n🔧 SOLUÇÃO MANUAL:');
    console.log('=================\n');
    console.log('1. No pgAdmin ou linha de comando, execute:');
    console.log('');
    console.log(`   CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';`);
    console.log(`   CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};`);
    console.log(`   GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};`);
    console.log('');
    console.log('2. Depois execute: npm start');
  }
}

setupDatabase();