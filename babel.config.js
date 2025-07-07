module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {
        unstable_transformProfile: 'hermes-stable',
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-syntax-decorators', { legacy: true }],
    'react-native-reanimated/plugin',
  ],
};
