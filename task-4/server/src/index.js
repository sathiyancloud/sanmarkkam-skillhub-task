import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { connectDb } from "./db.js";
import { requireAuth } from "./middleware/auth.js";
import { seedSuperadmin } from "./seedSuperadmin.js";
import { authRouter } from "./routes/auth.js";
import { suppliersRouter } from "./routes/suppliers.js";
import { requisitionsRouter } from "./routes/requisitions.js";
import { purchaseOrdersRouter } from "./routes/purchaseOrders.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "../../client/dist");

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/eprocurement";

if (!process.env.JWT_SECRET) {
  console.error("FATAL: set JWT_SECRET in server/.env (used to sign login tokens).");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "eprocurement-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/suppliers", requireAuth, suppliersRouter);
app.use("/api/requisitions", requireAuth, requisitionsRouter);
app.use("/api/purchase-orders", requireAuth, purchaseOrdersRouter);

if (process.env.SERVE_CLIENT === "1") {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

await connectDb(MONGODB_URI);
await seedSuperadmin();
app.listen(PORT, () => {
  const msg =
    process.env.SERVE_CLIENT === "1"
      ? `App + API at http://localhost:${PORT}`
      : `API at http://localhost:${PORT}`;
  console.log(msg);
});
