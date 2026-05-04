import { Router } from "express";
import { Requisition } from "../models/Requisition.js";

export const requisitionsRouter = Router();

requisitionsRouter.get("/", async (_req, res, next) => {
  try {
    const list = await Requisition.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

requisitionsRouter.get("/:id", async (req, res, next) => {
  try {
    const doc = await Requisition.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Requisition not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

requisitionsRouter.post("/", async (req, res, next) => {
  try {
    const doc = await Requisition.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

requisitionsRouter.put("/:id", async (req, res, next) => {
  try {
    const doc = await Requisition.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Requisition not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

requisitionsRouter.delete("/:id", async (req, res, next) => {
  try {
    const doc = await Requisition.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Requisition not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
