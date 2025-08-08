module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-typescript',
  ],

  plugins: [
    'react-native-worklets/plugin' // <-- Correct plugin, not reanimated
  ]
};
