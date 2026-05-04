import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout, isSuperadmin } = useAuth();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">
          Demo<span>ERP</span> · E-Procurement
          {isSuperadmin && (
            <span className="badge badge-superadmin" title="Superadmin account">
              Superadmin
            </span>
          )}
        </div>
        <nav className="nav-links">
          <NavLink end to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
          <NavLink to="/suppliers" className={({ isActive }) => (isActive ? "active" : "")}>
            Suppliers
          </NavLink>
          <NavLink to="/requisitions" className={({ isActive }) => (isActive ? "active" : "")}>
            Requisitions
          </NavLink>
          <NavLink to="/purchase-orders" className={({ isActive }) => (isActive ? "active" : "")}>
            Purchase orders
          </NavLink>
        </nav>
        <div className="nav-user">
          {user?.name && <span className="user-name">{user.name}</span>}
          <span className="user-email">{user?.email}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
