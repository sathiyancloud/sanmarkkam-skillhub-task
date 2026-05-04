import { Router } from "express";
import { PurchaseOrder } from "../models/PurchaseOrder.js";

export const purchaseOrdersRouter = Router();

purchaseOrdersRouter.get("/", async (_req, res, next) => {
  try {
    const list = await PurchaseOrder.find()
      .populate("supplier", "name email")
      .populate("requisition", "title status")
      .sort({ createdAt: -1 })
      .lean();
    const withTotals = list.map((po) => ({
      ...po,
      subtotal: (po.items || []).reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0
      ),
    }));
    res.json(withTotals);
  } catch (e) {
    next(e);
  }
});

purchaseOrdersRouter.get("/:id", async (req, res, next) => {
  try {
    const doc = await PurchaseOrder.findById(req.params.id)
      .populate("supplier")
      .populate("requisition")
      .lean();
    if (!doc) return res.status(404).json({ message: "Purchase order not found" });
    const subtotal = (doc.items || []).reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
    res.json({ ...doc, subtotal });
  } catch (e) {
    next(e);
  }
});

purchaseOrdersRouter.post("/", async (req, res, next) => {
  try {
    const doc = await PurchaseOrder.create(req.body);
    const populated = await PurchaseOrder.findById(doc._id)
      .populate("supplier", "name email")
      .populate("requisition", "title status")
      .lean();
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
});

purchaseOrdersRouter.put("/:id", async (req, res, next) => {
  try {
    const doc = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("supplier", "name email")
      .populate("requisition", "title status");
    if (!doc) return res.status(404).json({ message: "Purchase order not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

purchaseOrdersRouter.delete("/:id", async (req, res, next) => {
  try {
    const doc = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Purchase order not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
