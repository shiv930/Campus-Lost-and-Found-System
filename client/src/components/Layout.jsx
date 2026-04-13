import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
      : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Layout({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="font-display font-bold text-lg text-bgi-navy flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-bgi-navy flex items-center justify-center text-white text-sm shadow-lg shadow-teal-500/30 transition-transform hover:scale-105">
              BGI
            </span>
            <span className="hidden sm:inline">Lost & Found</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <NavLink to="/report-lost" className={linkClass}>
              Report Lost
            </NavLink>
            <NavLink to="/report-found" className={linkClass}>
              Report Found
            </NavLink>
            <NavLink to="/matches" className={linkClass}>
              Matches
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-xs text-slate-500 hidden lg:inline max-w-[140px] truncate">
                  {user?.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-bgi-navy text-white hover:bg-slate-800 transition-colors shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden border-t border-slate-100 px-2 py-2 flex flex-wrap gap-1 justify-center">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/report-lost" className={linkClass}>
            Lost
          </NavLink>
          <NavLink to="/report-found" className={linkClass}>
            Found
          </NavLink>
          <NavLink to="/matches" className={linkClass}>
            Matches
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          <p className="font-display font-semibold text-bgi-navy">Bansal Group of Institutes</p>
          <p className="mt-1">Campus Lost & Found — reuniting students with what matters.</p>
        </div>
      </footer>
    </div>
  );
}
