import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  dataBaseUrl: process.env.MONGO_DB_URL,
  env: process.env.NODE_ENV,
};

export const config = Object.freeze(_config);
