const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export const api = {
  getProducts() {
    return request("/products");
  },
  createOrder(payload) {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getOrder(id) {
    return request(`/orders/${id}`);
  },
  initiatePayment(payload) {
    return request("/payments/initiate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
