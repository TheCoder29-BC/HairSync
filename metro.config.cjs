// metro.config.cjs
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ignoriere den CLI-Ordner komplett
config.resolver.blacklistRE = /\/cli\/.*/;

module.exports = config;
