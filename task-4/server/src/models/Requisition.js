import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "ea", trim: true },
    estimatedUnitPrice: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const requisitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    requestedBy: { type: String, trim: true },
    justification: { type: String, trim: true },
    items: { type: [lineItemSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export const Requisition = mongoose.model("Requisition", requisitionSchema);
