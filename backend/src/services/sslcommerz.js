import axios from "axios";
import { env } from "../config/env.js";

const sandboxBase = "https://sandbox.sslcommerz.com";
const liveBase = "https://securepay.sslcommerz.com";

function getBaseUrl() {
  return env.paymentMode === "live" ? liveBase : sandboxBase;
}

export function hasSslCredentials() {
  return Boolean(env.sslStoreId && env.sslStorePassword);
}

export async function initiateSslPayment(payload) {
  const baseUrl = getBaseUrl();
  const response = await axios.post(`${baseUrl}/gwprocess/v4/api.php`, payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  return response.data;
}

export async function validateSslPayment(valId) {
  const baseUrl = getBaseUrl();
  const response = await axios.get(`${baseUrl}/validator/api/validationserverAPI.php`, {
    params: {
      val_id: valId,
      store_id: env.sslStoreId,
      store_passwd: env.sslStorePassword,
      format: "json"
    }
  });

  return response.data;
}
