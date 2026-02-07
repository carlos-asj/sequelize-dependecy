// server.js
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { setupDatabase } from './src/models/index.js';
import apiRoutes from './src/routes/api.js';

// Carregar variáveis de ambiente
config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Configuração do middleware
 */
app.use(cors()); // Permitir requisições de diferentes origens
app.use(express.json()); // Parsear JSON no body das requisições
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded data

/**
 * Rota de saúde da aplicação
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    environment: process.env.NODE_ENV
  });
});

/**
 * Rotas da API
 */
app.use('/api', apiRoutes);

/**
 * Middleware para rotas não encontradas
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

/**
 * Middleware para tratamento de erros
 */
app.use((error, req, res, next) => {
  console.error('Erro na aplicação:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

/**
 * Inicialização do servidor
 */
async function startServer() {
  try {
    // Conectar ao banco de dados
    await setupDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n✨ Servidor iniciado com sucesso!');
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Banco: ${process.env.DB_NAME}`);
      console.log('\n🛣️  Rotas disponíveis:');
      console.log(`   GET  http://localhost:${PORT}/health`);
      console.log(`   GET  http://localhost:${PORT}/api/equipments`);
      console.log(`   GET  http://localhost:${PORT}/api/customers`);
      console.log(`   POST http://localhost:${PORT}/api/equipments`);
      console.log(`   POST http://localhost:${PORT}/api/customers`);
      console.log('\n⚡ Use Ctrl+C para parar o servidor\n');
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

// Iniciar aplicação
startServer();