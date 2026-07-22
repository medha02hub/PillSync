import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth";
import { supabase } from "@/supabaseClient";
import Layout from "@/components/Layout";

interface Medicine {
  id: number;
  medicine_name: string;
  dosage: string;
  reminder_time: string;
}

interface HistoryItem {
  id: number;
  medicine_name: string;
  taken_date: string;
  status: string;
}

// Dashboard — welcome message, today's medicines, recent history, quick buttons
export default function Dashboard() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load the user's medicines
    supabase
      .from("medicines")
      .select("id, medicine_name, dosage, reminder_time")
      .eq("user_id", user.id)
      .order("id")
      .then(({ data }) => setMedicines(data || []));

    // Load recent history (join with medicines to get the name)
    supabase
      .from("history")
      .select("id, taken_date, status, medicines(medicine_name)")
      .order("id", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (!data) return setHistory([]);
        setHistory(
          data.map((h: any) => ({
            id: h.id,
            medicine_name: h.medicines?.medicine_name || "Unknown",
            taken_date: h.taken_date,
            status: h.status,
          }))
        );
      });
  }, [user]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome, {user?.name} 👋
      </h1>

      {/* Quick buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          to="/medicines"
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-medium"
        >
          + Add Medicine
        </Link>
        <Link
          to="/profile"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
        >
          Profile
        </Link>
        <Link
          to="/history"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
        >
          History
        </Link>
      </div>

      {/* Today's medicines */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Today's Medicines</h2>
      {medicines.length === 0 ? (
        <p className="text-gray-500 mb-8">No medicines added yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {medicines.map((m) => (
            <div key={m.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800">{m.medicine_name}</h3>
              <p className="text-gray-600 text-sm">Dosage: {m.dosage}</p>
              <p className="text-gray-600 text-sm">Time: {m.reminder_time}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent medication history */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Medication History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">No history yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">Medicine</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-sm text-gray-700">{h.medicine_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{h.taken_date}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
