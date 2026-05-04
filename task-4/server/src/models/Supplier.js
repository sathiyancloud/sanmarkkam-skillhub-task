import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    taxId: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
