import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  dataBaseUrl: process.env.MONGO_DB_URL,
  env: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
};

export const config = Object.freeze(_config);
