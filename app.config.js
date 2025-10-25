// Inject env vars into Expo extra so they are available at runtime
// CN: 从 .env(.local) 注入到运行时（前端 bundle）可读取的 extra
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    API_BASE_URL: process.env.API_BASE_URL,
    JWT_TOKEN: process.env.JWT_TOKEN,
    USERNAME: process.env.USERNAME,
  },
});