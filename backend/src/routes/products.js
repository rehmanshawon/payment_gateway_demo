import { Router } from "express";
import { getPool } from "../config/db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [products] = await getPool().query(
      "SELECT id, slug, title, description, price, image, category, badge FROM products ORDER BY id ASC"
    );

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

export default router;
