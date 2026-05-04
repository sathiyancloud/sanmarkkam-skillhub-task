import { useEffect, useState } from "react";
import { requisitionsApi } from "../api.js";

const statuses = ["draft", "submitted", "approved", "rejected"];

function badgeClass(status) {
  return `badge badge-${status}`;
}

export default function Requisitions() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    title: "",
    department: "",
    requestedBy: "",
    justification: "",
    items: [{ description: "", quantity: 1, unit: "ea", estimatedUnitPrice: 0 }],
    status: "draft",
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    setErr(null);
    try {
      const { data } = await requisitionsApi.list();
      setRows(data);
    } catch (e) {
      setErr(e.message || "Failed to load requisitions.");
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
        [field]:
          field === "quantity" || field === "estimatedUnitPrice" ? Number(value) || 0 : value,
      };
      return { ...f, items };
    });
  }

  function addLine() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: "", quantity: 1, unit: "ea", estimatedUnitPrice: 0 }],
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
    const items = form.items.filter((x) => x.description.trim());
    if (items.length === 0) {
      setErr("Add at least one line with a description.");
      return;
    }
    setErr(null);
    try {
      await requisitionsApi.create({ ...form, items });
      setForm({
        title: "",
        department: "",
        requestedBy: "",
        justification: "",
        items: [{ description: "", quantity: 1, unit: "ea", estimatedUnitPrice: 0 }],
        status: "draft",
      });
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Save failed.");
    }
  }

  async function updateStatus(id, status) {
    setErr(null);
    try {
      await requisitionsApi.update(id, { status });
      await load();
    } catch (e) {
      setErr(e.message || "Update failed.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this requisition?")) return;
    setErr(null);
    try {
      await requisitionsApi.remove(id);
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed.");
    }
  }

  return (
    <>
      <h1 className="page-title">Purchase requisitions</h1>
      <p className="page-desc">Internal requests before a PO is issued to a supplier.</p>
      {err && <p className="error">{err}</p>}

      <div className="card">
        <h2>New requisition</h2>
        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="field" style={{ flex: "1 1 220px" }}>
              <label htmlFor="title">Title *</label>
              <input id="title" value={form.title} onChange={(e) => setField("title", e.target.value)} required />
            </div>
            <div className="field" style={{ flex: "1 1 140px" }}>
              <label htmlFor="department">Department</label>
              <input
                id="department"
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
              />
            </div>
            <div className="field" style={{ flex: "1 1 140px" }}>
              <label htmlFor="requestedBy">Requested by</label>
              <input
                id="requestedBy"
                value={form.requestedBy}
                onChange={(e) => setField("requestedBy", e.target.value)}
              />
            </div>
            <div className="field" style={{ flex: "0 1 160px" }}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="justification">Justification</label>
            <textarea
              id="justification"
              value={form.justification}
              onChange={(e) => setField("justification", e.target.value)}
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
                  <label>Est. unit $</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.estimatedUnitPrice}
                    onChange={(e) => setItem(i, "estimatedUnitPrice", e.target.value)}
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
              Create requisition
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Open requisitions</h2>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="empty">No requisitions yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Status</th>
                <th>Lines</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{r.department || "—"}</td>
                  <td>
                    <span className={badgeClass(r.status)}>{r.status}</span>
                  </td>
                  <td>{(r.items || []).length}</td>
                  <td>
                    <div className="inline-actions">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r._id, e.target.value)}
                        aria-label={`Status for ${r.title}`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn btn-ghost" onClick={() => remove(r._id)}>
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
