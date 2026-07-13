module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      // SUPPRIMER "react-native-reanimated/plugin"
      // Reanimated 4.x ne l'utilise plus
    ]
  };
};