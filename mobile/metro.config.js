// ============================================
// Anchor Daily - Metro Bundler Config
// ============================================
// Wraps the default Expo Metro config with Sentry's
// plugin to enable automatic source map upload and
// correct native crash symbolication in production.
//
// See: https://docs.sentry.io/platforms/react-native/manual-setup/metro/

const { getDefaultConfig } = require('expo/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

const config = getDefaultConfig(__dirname);

module.exports = withSentryConfig(config);
