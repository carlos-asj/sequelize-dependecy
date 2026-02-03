// jest.config.js - Híbrido (funciona sem Babel)
module.exports = {
  testEnvironment: 'node',
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/src/**/*.test.js'
  ],
  
  // Para ES6 modules no Node.js 18+
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Extensões
  moduleFileExtensions: ['js', 'json'],
  
  // Ignorar transformações se não usar Babel
  // transform: undefined,
  
  // Para lidar com imports ES6 em CommonJS
  transformIgnorePatterns: [
    // Não transformar node_modules
    '/node_modules/(?!(module1|module2)/)'
  ]
};