const expo = require("expo/metro-config");
const config = expo.getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  stream: require.resolve("stream-browserify")
};

module.exports = config;
