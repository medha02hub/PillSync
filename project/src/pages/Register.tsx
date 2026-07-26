import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth";

// Register page — name, email, password, role
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Patient");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register({ name, email, password, role });
      navigate("/dashboard");
    } catch (err: any) {
      // Log the full error to the browser console for debugging
      console.error("Registration error:", err);

      // Show the exact backend error message when available
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <span className="text-4xl">💊</span>
          <h1 className="text-2xl font-bold text-teal-600 mt-2">PillSync</h1>
          <p className="text-gray-500">Create a new account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Patient">Patient</option>
              <option value="Caregiver">Caregiver</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 font-medium"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
