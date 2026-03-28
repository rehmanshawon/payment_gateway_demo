import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

function required(name, fallback = "") {
  return process.env[name] || fallback;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  dbHost: required("DB_HOST", "127.0.0.1"),
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: required("DB_USER", "root"),
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: required("DB_NAME", "payment_gateway_demo"),
  frontendBaseUrl: required("FRONTEND_BASE_URL", "http://localhost:5173"),
  publicApiBaseUrl: required("PUBLIC_API_BASE_URL", "http://localhost:4000"),
  paymentMode: required("PAYMENT_MODE", "mock").toLowerCase(),
  sslStoreId: process.env.SSL_STORE_ID || "",
  sslStorePassword: process.env.SSL_STORE_PASSWORD || "",
};
