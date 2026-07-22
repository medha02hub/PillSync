import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/auth";
import Layout from "@/components/Layout";

interface HistoryItem {
  id: number;
  medicine_name: string;
  taken_date: string;
  status: string;
}

// Medication History page — simple table of all taken records
export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!user) return;

    // Join history with medicines to get the medicine name, filtered by user
    supabase
      .from("history")
      .select("id, taken_date, status, medicines(medicine_name, user_id)")
      .order("id", { ascending: false })
      .then(({ data }) => {
        if (!data) return setHistory([]);
        // Filter to only this user's medicines
        const filtered = data
          .filter((h: any) => h.medicines?.user_id === user.id)
          .map((h: any) => ({
            id: h.id,
            medicine_name: h.medicines?.medicine_name || "Unknown",
            taken_date: h.taken_date,
            status: h.status,
          }));
        setHistory(filtered);
      });
  }, [user]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Medication History</h1>

      {history.length === 0 ? (
        <p className="text-gray-500">No history yet. Click "Take Medicine" on a medicine card.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Medicine Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-700">{h.medicine_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{h.taken_date}</td>
                  <td className="px-4 py-3 text-sm">
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
