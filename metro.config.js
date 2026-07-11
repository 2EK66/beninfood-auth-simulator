const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Forcer WebSocket natif au lieu de ws (Node.js)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "stream") {
    return { type: "empty" };
  }
  if (moduleName === "ws") {
    return { type: "empty" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
