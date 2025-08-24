const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Suprimir avisos específicos durante desenvolvimento
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configuração para suprimir avisos de notificações no Expo Go
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  mangle: {
    ...config.transformer.minifierConfig?.mangle,
    keep_fnames: true,
  },
};

module.exports = config;
