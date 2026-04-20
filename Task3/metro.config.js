const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to only use the node_modules in Task1, not the parent directory
config.resolver.nodeModulesPaths = [__dirname + '/node_modules'];
config.watchFolders = [__dirname];

module.exports = config;
