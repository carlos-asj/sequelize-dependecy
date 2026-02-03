import { sequelize } from '../../models/index.js';
import dbHealth from '../../utils/dbHealth.js'

describe('Database Synchronization', () => {
  beforeAll(async () => {
    // Aguardar conexão
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should connect to database', async () => {
    const isConnected = await dbHealth.checkConnection();
    expect(isConnected).toBe(true);
  });

  test('should have all required tables', async () => {
    const tables = await dbHealth.checkAllTables();
    
    expect(tables.clientes.exists).toBe(true);
    expect(tables.equipamentos.exists).toBe(true);
    
    // Verificar estrutura
    expect(tables.clientes.structure.isValid).toBe(true);
    expect(tables.equipamentos.structure.isValid).toBe(true);
  });

  test('should have correct foreign key relationships', async () => {
    const foreignKeys = await dbHealth.checkForeignKeys();
    
    // Verificar se existe a FK de equipamentos para clientes
    const equipamentoToClienteFK = foreignKeys.find(
      fk => fk.table_name === 'equipamentos' && fk.column_name === 'cliente_id'
    );
    
    expect(equipamentoToClienteFK).toBeDefined();
    expect(equipamentoToClienteFK.foreign_table_name).toBe('clientes');
  });

  test('should have required indexes', async () => {
    const indexes = await dbHealth.checkIndexes();
    
    const expectedIndexes = [
      { table: 'clientes', type: 'email' },
      { table: 'clientes', type: 'cpf_cnpj' },
      { table: 'equipamentos', type: 'cliente_id' },
      { table: 'equipamentos', type: 'numero_serie' },
      { table: 'equipamentos', type: 'patrimonio' }
    ];
    
    expectedIndexes.forEach(expected => {
      const found = indexes.some(
        idx => idx.tablename === expected.table && 
               idx.indexname.includes(expected.type)
      );
      expect(found).toBe(true);
    });
  });

  test('should allow basic CRUD operations', async () => {
    // Testar operação de criação
    const Cliente = sequelize.models.Cliente;
    
    const testCliente = await Cliente.create({
      name: 'Client Test',
      cpf_cnpj: '111.222.333-44'
    });
    
    expect(testClient.id).toBeDefined();
    expect(testClient.nome).toBe('Client Test');
    
    // Cleanup
    await testCliente.destroy({ force: true });
  });
});