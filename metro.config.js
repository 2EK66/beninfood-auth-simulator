const { getDefaultConfig } = require("expo/metro-config");
const nativewind = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = nativewind.withNativeWind(config, { input: "./global.css" });
