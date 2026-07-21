const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Désactive la minification agressive si elle fait boucler le bundler sous Linux
config.transformer = {
  ...config.transformer,
  minifierPath: require.resolve("metro-minify-terser"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
