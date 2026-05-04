import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { suppliersApi, requisitionsApi, purchaseOrdersApi, formatMoney } from "../api.js";

export default function Dashboard() {
  const [counts, setCounts] = useState({ suppliers: 0, requisitions: 0, pos: 0, openPoValue: 0 });
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sRes, rRes, pRes] = await Promise.all([
          suppliersApi.list(),
          requisitionsApi.list(),
          purchaseOrdersApi.list(),
        ]);
        if (cancelled) return;
        const pos = pRes.data || [];
        const openValue = pos
          .filter((p) => p.status !== "closed" && p.status !== "cancelled")
          .reduce((sum, p) => sum + (p.subtotal || 0), 0);
        setCounts({
          suppliers: (sRes.data || []).length,
          requisitions: (rRes.data || []).length,
          pos: pos.length,
          openPoValue: openValue,
        });
      } catch (e) {
        if (!cancelled) setErr(e.message || "Could not load dashboard.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-desc">
        Lightweight e-procurement: suppliers, purchase requisitions, and purchase orders stored in
        MongoDB.
      </p>
      {err && <p className="error">{err}</p>}
      <div className="stats">
        <div className="stat">
          <p className="label">Suppliers</p>
          <p className="value">{counts.suppliers}</p>
        </div>
        <div className="stat">
          <p className="label">Requisitions</p>
          <p className="value">{counts.requisitions}</p>
        </div>
        <div className="stat">
          <p className="label">Purchase orders</p>
          <p className="value">{counts.pos}</p>
        </div>
        <div className="stat">
          <p className="label">Open PO value</p>
          <p className="value" style={{ fontSize: "1.25rem" }}>
            {formatMoney(counts.openPoValue)}
          </p>
        </div>
      </div>
      <div className="card">
        <h2>Quick links</h2>
        <p className="empty" style={{ marginBottom: "0.75rem" }}>
          Start by adding suppliers, then create requisitions and issue purchase orders.
        </p>
        <div className="inline-actions">
          <Link to="/suppliers" className="btn btn-primary">
            Manage suppliers
          </Link>
          <Link to="/requisitions" className="btn btn-ghost">
            Requisitions
          </Link>
          <Link to="/purchase-orders" className="btn btn-ghost">
            Purchase orders
          </Link>
        </div>
      </div>
    </>
  );
}
