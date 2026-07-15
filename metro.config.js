const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Metro à utiliser les exports React Native des packages
config.resolver.unstable_enablePackageExports = true;

module.exports = config;