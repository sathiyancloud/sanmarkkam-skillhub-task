import { useEffect, useState } from "react";
import { suppliersApi } from "../api.js";

const emptyForm = { name: "", email: "", phone: "", address: "", taxId: "", rating: 3, notes: "" };

export default function Suppliers() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    setErr(null);
    try {
      const { data } = await suppliersApi.list();
      setRows(data);
    } catch (e) {
      setErr(e.message || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "rating" ? Number(value) : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await suppliersApi.create(form);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Save failed.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this supplier?")) return;
    setErr(null);
    try {
      await suppliersApi.remove(id);
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed.");
    }
  }

  return (
    <>
      <h1 className="page-title">Suppliers</h1>
      <p className="page-desc">Vendor master data used on purchase orders.</p>
      {err && <p className="error">{err}</p>}

      <div className="card">
        <h2>Add supplier</h2>
        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="name">Name *</label>
              <input id="name" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div className="field" style={{ flex: "1 1 180px" }}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={onChange} />
            </div>
            <div className="field" style={{ flex: "0 1 140px" }}>
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={onChange} />
            </div>
          </div>
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <div className="field" style={{ flex: "1 1 100%" }}>
              <label htmlFor="address">Address</label>
              <input id="address" name="address" value={form.address} onChange={onChange} />
            </div>
          </div>
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor="taxId">Tax ID</label>
              <input id="taxId" name="taxId" value={form.taxId} onChange={onChange} />
            </div>
            <div className="field" style={{ flex: "0 1 100px" }}>
              <label htmlFor="rating">Rating (1–5)</label>
              <input
                id="rating"
                name="rating"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={onChange}
              />
            </div>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="notes">Notes</label>
              <input id="notes" name="notes" value={form.notes} onChange={onChange} />
            </div>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Directory</h2>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="empty">No suppliers yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Rating</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email || "—"}</td>
                  <td>{s.phone || "—"}</td>
                  <td>{s.rating}</td>
                  <td>
                    <button type="button" className="btn btn-ghost" onClick={() => remove(s._id)}>
                      Delete
                    </button>
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
