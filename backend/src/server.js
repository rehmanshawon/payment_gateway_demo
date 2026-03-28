import cors from "cors";
import express from "express";
import { initializeDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

app.use(cors({ origin: env.frontendBaseUrl, credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    paymentMode: env.paymentMode
  });
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || "Unexpected server error."
  });
});

async function start() {
  await initializeDatabase();

  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start the backend:", error);

  if (error.code === "ER_ACCESS_DENIED_ERROR") {
    console.error(
      "MySQL credentials were rejected. Update backend/.env with a valid DB_USER and DB_PASSWORD."
    );
  }

  if (error.code === "ECONNREFUSED") {
    console.error(
      "MySQL is not reachable. Start your MySQL server and make sure DB_HOST/DB_PORT in backend/.env are correct."
    );
  }

  process.exit(1);
});
