import { useEffect, useState } from "react";
import {
  purchaseOrdersApi,
  suppliersApi,
  requisitionsApi,
  formatMoney,
} from "../api.js";

const poStatuses = ["draft", "issued", "acknowledged", "closed", "cancelled"];

function badgeClass(status) {
  const map = {
    draft: "draft",
    issued: "issued",
    acknowledged: "acknowledged",
    closed: "closed",
    cancelled: "cancelled",
  };
  return `badge badge-${map[status] || "draft"}`;
}

export default function PurchaseOrders() {
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [form, setForm] = useState({
    supplier: "",
    requisition: "",
    currency: "USD",
    status: "draft",
    deliveryNotes: "",
    items: [{ description: "", quantity: 1, unit: "ea", unitPrice: 0 }],
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function loadRefs() {
    const [sRes, rRes] = await Promise.all([suppliersApi.list(), requisitionsApi.list()]);
    setSuppliers(sRes.data || []);
    setRequisitions(rRes.data || []);
  }

  async function load() {
    setErr(null);
    try {
      await loadRefs();
      const { data } = await purchaseOrdersApi.list();
      setRows(data);
    } catch (e) {
      setErr(e.message || "Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function setItem(i, field, value) {
    setForm((f) => {
      const items = [...f.items];
      items[i] = {
        ...items[i],
        [field]: field === "quantity" || field === "unitPrice" ? Number(value) || 0 : value,
      };
      return { ...f, items };
    });
  }

  function addLine() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: "", quantity: 1, unit: "ea", unitPrice: 0 }],
    }));
  }

  function removeLine(i) {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, idx) => idx !== i),
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.supplier) {
      setErr("Choose a supplier.");
      return;
    }
    const items = form.items.filter((x) => x.description.trim());
    if (items.length === 0) {
      setErr("Add at least one line with a description.");
      return;
    }
    setErr(null);
    const body = {
      supplier: form.supplier,
      requisition: form.requisition || undefined,
      currency: form.currency,
      status: form.status,
      deliveryNotes: form.deliveryNotes || undefined,
      items,
    };
    try {
      await purchaseOrdersApi.create(body);
      setForm({
        supplier: "",
        requisition: "",
        currency: "USD",
        status: "draft",
        deliveryNotes: "",
        items: [{ description: "", quantity: 1, unit: "ea", unitPrice: 0 }],
      });
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Save failed.");
    }
  }

  async function updateStatus(id, status) {
    setErr(null);
    try {
      await purchaseOrdersApi.update(id, { status });
      await load();
    } catch (e) {
      setErr(e.message || "Update failed.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this purchase order?")) return;
    setErr(null);
    try {
      await purchaseOrdersApi.remove(id);
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed.");
    }
  }

  return (
    <>
      <h1 className="page-title">Purchase orders</h1>
      <p className="page-desc">Issue POs to suppliers; optionally link back to an approved requisition.</p>
      {err && <p className="error">{err}</p>}

      <div className="card">
        <h2>Create purchase order</h2>
        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="supplier">Supplier *</label>
              <select
                id="supplier"
                value={form.supplier}
                onChange={(e) => setField("supplier", e.target.value)}
                required
              >
                <option value="">Select…</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="requisition">Requisition (optional)</label>
              <select
                id="requisition"
                value={form.requisition}
                onChange={(e) => setField("requisition", e.target.value)}
              >
                <option value="">None</option>
                {requisitions.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title} ({r.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: "0 1 90px" }}>
              <label htmlFor="currency">Currency</label>
              <input id="currency" value={form.currency} onChange={(e) => setField("currency", e.target.value)} />
            </div>
            <div className="field" style={{ flex: "0 1 140px" }}>
              <label htmlFor="poStatus">Status</label>
              <select
                id="poStatus"
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                {poStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="deliveryNotes">Delivery notes</label>
            <textarea
              id="deliveryNotes"
              value={form.deliveryNotes}
              onChange={(e) => setField("deliveryNotes", e.target.value)}
            />
          </div>

          <div className="line-items">
            <h3>Line items</h3>
            {form.items.map((line, i) => (
              <div key={i} className="row" style={{ marginBottom: "0.5rem", alignItems: "flex-end" }}>
                <div className="field" style={{ flex: "2 1 200px" }}>
                  <label>Description</label>
                  <input value={line.description} onChange={(e) => setItem(i, "description", e.target.value)} />
                </div>
                <div className="field" style={{ flex: "0 1 80px" }}>
                  <label>Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => setItem(i, "quantity", e.target.value)}
                  />
                </div>
                <div className="field" style={{ flex: "0 1 70px" }}>
                  <label>Unit</label>
                  <input value={line.unit} onChange={(e) => setItem(i, "unit", e.target.value)} />
                </div>
                <div className="field" style={{ flex: "0 1 110px" }}>
                  <label>Unit price</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => setItem(i, "unitPrice", e.target.value)}
                  />
                </div>
                {form.items.length > 1 && (
                  <button type="button" className="btn btn-ghost" onClick={() => removeLine(i)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addLine}>
              + Line
            </button>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary">
              Create PO
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>All purchase orders</h2>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="empty">No purchase orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Requisition</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id}>
                  <td>{p.poNumber}</td>
                  <td>{p.supplier?.name || "—"}</td>
                  <td>{p.requisition?.title || "—"}</td>
                  <td>{formatMoney(p.subtotal || 0, p.currency)}</td>
                  <td>
                    <span className={badgeClass(p.status)}>{p.status}</span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      <select
                        value={p.status}
                        onChange={(e) => updateStatus(p._id, e.target.value)}
                        aria-label={`PO ${p.poNumber} status`}
                      >
                        {poStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn btn-ghost" onClick={() => remove(p._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
