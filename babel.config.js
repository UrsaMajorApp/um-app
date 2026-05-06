module.exports = (api) => {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            $app: './app',
            $components: './components',
            $constants: './constants',
            $contexts: './contexts',
            $data: './data',
            $hooks: './hooks',
            $lib: './lib',
            $types: './types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
