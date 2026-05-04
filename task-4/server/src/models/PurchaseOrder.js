import mongoose from "mongoose";

const poLineSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "ea", trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, unique: true, sparse: true, trim: true },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    requisition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requisition",
    },
    items: { type: [poLineSchema], default: [] },
    currency: { type: String, default: "USD", trim: true },
    status: {
      type: String,
      enum: ["draft", "issued", "acknowledged", "closed", "cancelled"],
      default: "draft",
    },
    deliveryNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

purchaseOrderSchema.pre("save", async function assignPoNumber() {
  if (!this.poNumber) {
    const Model = this.constructor;
    const count = await Model.countDocuments();
    this.poNumber = `PO-${String(count + 1).padStart(5, "0")}`;
  }
});

/** Sum line totals */
purchaseOrderSchema.virtual("subtotal").get(function subtotal() {
  return (this.items || []).reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  );
});

purchaseOrderSchema.set("toJSON", { virtuals: true });
purchaseOrderSchema.set("toObject", { virtuals: true });

export const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
