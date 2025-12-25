const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Lucide React Native için CJS ve MJS desteği
config.resolver.sourceExts.push('mjs', 'cjs');

// Eğer gerekirse SVG desteği
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
