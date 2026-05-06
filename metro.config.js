// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'react-native', 'development'];

const ALIASES = {
  $app: path.resolve(__dirname, 'app'),
  $components: path.resolve(__dirname, 'components'),
  $constants: path.resolve(__dirname, 'constants'),
  $contexts: path.resolve(__dirname, 'contexts'),
  $data: path.resolve(__dirname, 'data'),
  $hooks: path.resolve(__dirname, 'hooks'),
  $lib: path.resolve(__dirname, 'lib'),
  $types: path.resolve(__dirname, 'types'),
  tslib: 'tslib/tslib.es6.js',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const [alias, targetPath] of Object.entries(ALIASES)) {
    if (moduleName === alias || moduleName.startsWith(`${alias}/`)) {
      return context.resolveRequest(context, moduleName.replace(alias, targetPath), platform);
    }
  }

  return context.resolveRequest(context, ALIASES[moduleName] ?? moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: './global.css',
});
