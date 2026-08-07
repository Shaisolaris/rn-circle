// Dynamic Expo config. EXPO_BASE_PATH lets the same build be hosted from a
// sub-path (e.g. GitHub Pages project sites at https://<user>.github.io/rn-circle/)
// by prefixing the exported web bundle's asset URLs.
const basePath = process.env.EXPO_BASE_PATH || '';

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'Circle',
  slug: 'rn-circle',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'circle',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0B1220',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.circle.mobile',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B1220',
    },
    package: 'com.circle.mobile',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    backgroundColor: '#0B1220',
  },
  experiments: {
    baseUrl: basePath,
  },
  extra: {
    basePath,
  },
};

module.exports = config;
