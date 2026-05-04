import { Router } from "express";
import { Supplier } from "../models/Supplier.js";

export const suppliersRouter = Router();

suppliersRouter.get("/", async (_req, res, next) => {
  try {
    const list = await Supplier.find().sort({ name: 1 }).lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

suppliersRouter.get("/:id", async (req, res, next) => {
  try {
    const doc = await Supplier.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Supplier not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

suppliersRouter.post("/", async (req, res, next) => {
  try {
    const doc = await Supplier.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

suppliersRouter.put("/:id", async (req, res, next) => {
  try {
    const doc = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Supplier not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

suppliersRouter.delete("/:id", async (req, res, next) => {
  try {
    const doc = await Supplier.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Supplier not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
