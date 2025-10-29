// Inject env vars into Expo extra so they are available at runtime
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    API_BASE_URL: process.env.API_BASE_URL,
    JWT_TOKEN: process.env.JWT_TOKEN,
    USERNAME: process.env.USERNAME,
  },
});