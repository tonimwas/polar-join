const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = (() => {
  const { assetExts, sourceExts } = require('metro-config');
  const defaultConfig = getDefaultConfig(__dirname);
  
  return {
    ...defaultConfig,
    transformer: {
      ...defaultConfig.transformer,
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      ...defaultConfig.resolver,
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: {
        ...require('node-libs-react-native'),
        ...defaultConfig.resolver.extraNodeModules,
      },
    },
  };
})();
