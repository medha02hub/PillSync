import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth";

// Simple top navigation bar shown on all authenticated pages
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">💊</span>
          <span className="text-xl font-bold text-teal-600">PillSync</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-700 hover:text-teal-600 font-medium">
            Dashboard
          </Link>
          <Link to="/medicines" className="text-gray-700 hover:text-teal-600 font-medium">
            Medicines
          </Link>
          <Link to="/history" className="text-gray-700 hover:text-teal-600 font-medium">
            History
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-teal-600 font-medium">
            Profile
          </Link>
          <span className="text-gray-500 hidden sm:inline">|</span>
          <span className="text-gray-600 hidden sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
