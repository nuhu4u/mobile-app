const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure Metro for wireless development
config.server = {
  ...config.server,
  host: '0.0.0.0', // Allow connections from any IP
  port: 8081,
};

// Enable source maps for better debugging
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;