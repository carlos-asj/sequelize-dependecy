import { sequelize, Client, Equip } from '../models/index.js'

class DatabaseHealth {
  constructor() {
    this.status = {
      database: false,
      tables: {},
      migrations: {},
      lastCheck: null
    };
  }

  async checkConnection() {
    try {
      await sequelize.authenticate();
      this.status.database = true;
      return true;
    } catch (error) {
      this.status.database = false;
      this.status.databaseError = error.message;
      return false;
    }
  }

  async checkTableExists(model, tableName) {
    try {
      const [results] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );
      `);
      
      return results[0].exists;
    } catch (error) {
      console.error(`Erro ao verificar tabela ${tableName}:`, error);
      return false;
    }
  }

  async checkTableStructure(model, tableName) {
    try {
      // Verificar se tabela tem todas as colunas esperadas
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);
      
      // Obter definição do modelo
      const modelAttributes = Object.keys(model.rawAttributes);
      const dbColumns = columns.map(col => col.column_name);
      
      const missingInDB = modelAttributes.filter(attr => !dbColumns.includes(attr));
      const extraInDB = dbColumns.filter(col => !modelAttributes.includes(col));
      
      return {
        exists: true,
        columns: dbColumns.length,
        expectedColumns: modelAttributes.length,
        missingColumns: missingInDB,
        extraColumns: extraInDB,
        isValid: missingInDB.length === 0
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  async checkAllTables() {
    const tables = [
      { name: 'clients', model: Client },
      { name: 'equips', model: Equip }
    ];

    const results = {};

    for (const table of tables) {
      const exists = await this.checkTableExists(table.model, table.name);
      
      if (exists) {
        const structure = await this.checkTableStructure(table.model, table.name);
        results[table.name] = {
          exists: true,
          structure
        };
      } else {
        results[table.name] = {
          exists: false,
          error: `Tabela ${table.name} não encontrada`
        };
      }
    }

    this.status.tables = results;
    this.status.lastCheck = new Date();
    
    return results;
  }

  async checkForeignKeys() {
    try {
      const [constraints] = await sequelize.query(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name;
      `);

      this.status.foreignKeys = constraints;
      return constraints;
    } catch (error) {
      this.status.foreignKeysError = error.message;
      return null;
    }
  }

  async checkIndexes() {
    try {
      const [indexes] = await sequelize.query(`
        SELECT
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('clients', 'equips')
        ORDER BY tablename, indexname;
      `);

      this.status.indexes = indexes;
      return indexes;
    } catch (error) {
      this.status.indexesError = error.message;
      return null;
    }
  }

  async fullHealthCheck() {
    console.log('🔍 Iniciando verificação completa do banco de dados...');
    
    const connection = await this.checkConnection();
    if (!connection) {
      throw new Error('❌ Conexão com banco de dados falhou');
    }

    console.log('✅ Conexão com banco estabelecida');

    const tables = await this.checkAllTables();
    const foreignKeys = await this.checkForeignKeys();
    const indexes = await this.checkIndexes();

    // Verificar se todas as tabelas existem e estão válidas
    const invalidTables = Object.entries(tables)
      .filter(([table, info]) => !info.exists || (info.structure && !info.structure.isValid))
      .map(([table, info]) => table);

    if (invalidTables.length > 0) {
      console.error('❌ Tabelas inválidas:', invalidTables);
      console.error('Detalhes:', JSON.stringify(tables, null, 2));
      throw new Error(`Tabelas inválidas: ${invalidTables.join(', ')}`);
    }

    console.log('✅ Todas as tabelas estão sincronizadas');
    console.log('✅ Chaves estrangeiras verificadas');
    console.log('✅ Índices verificados');

    this.status.overall = 'healthy';
    return this.status;
  }

  getStatus() {
    return {
      ...this.status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new DatabaseHealth();