// jest.config.js
module.exports = {
    transform: {
      '^.+\\.(js|jsx)?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(axios)/)', // Asegúrate de que axios se transforme
    ],
    testEnvironment: 'jsdom', // Asegúrate de que el entorno de prueba sea adecuado para React
  };
  