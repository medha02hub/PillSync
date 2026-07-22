import { useState } from "react";
import { useAuth } from "@/auth";
import { supabase } from "@/supabaseClient";
import Layout from "@/components/Layout";

// Profile page — view and edit profile fields
export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name,
          email,
          age: age ? parseInt(age) : null,
          phone,
        })
        .eq("id", user!.id);

      if (error) throw new Error(error.message);
      await refreshUser();
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      console.error("Profile update error:", err);
      setMessage(err.message || "Update failed");
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="max-w-lg bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Role is shown but not editable */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            value={user?.role || ""}
            disabled
            className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 font-medium"
          >
            Save Changes
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              message.includes("success")
                ? "bg-teal-50 text-teal-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </Layout>
  );
}
