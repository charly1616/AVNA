import { Link } from "react-router";
import { useAuthStore } from "../../store/useAuthStore.js";

export function Navbar() {
  const { isAuthenticated, teacher, logout } = useAuthStore();

  return (
    <header className="top-nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">T</span>
          <span>TeacherPortal</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/" className="nav-link active">Overview</Link>
          <Link to="/" className="nav-link">Classes</Link>
          <Link to="/" className="nav-link">Students</Link>
          <Link to="/" className="nav-link">Reports</Link>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-user">
                <span className="nav-user-dot" />
                {teacher?.name || "Teacher"}
              </span>
              <button type="button" onClick={logout} className="theme-button theme-button-secondary small-button">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="theme-button theme-button-primary small-button">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;