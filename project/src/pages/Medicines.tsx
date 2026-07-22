import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/auth";
import Layout from "@/components/Layout";

interface Medicine {
  id: number;
  medicine_name: string;
  dosage: string;
  reminder_time: string;
}

// Medicines page — list, add, edit, delete, send reminder, take medicine
export default function Medicines() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [message, setMessage] = useState("");

  // Load all medicines for the logged-in user
  async function loadMedicines() {
    if (!user) return;
    const { data } = await supabase
      .from("medicines")
      .select("id, medicine_name, dosage, reminder_time")
      .eq("user_id", user.id)
      .order("id");
    setMedicines(data || []);
  }

  useEffect(() => {
    loadMedicines();
  }, [user]);

  // Add or update a medicine
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase
        .from("medicines")
        .update({
          medicine_name: medicineName,
          dosage,
          reminder_time: reminderTime,
        })
        .eq("id", editingId);
    } else {
      await supabase.from("medicines").insert({
        user_id: user!.id,
        medicine_name: medicineName,
        dosage,
        reminder_time: reminderTime,
      });
    }
    resetForm();
    await loadMedicines();
  }

  // Populate the form for editing
  function startEdit(m: Medicine) {
    setEditingId(m.id);
    setMedicineName(m.medicine_name);
    setDosage(m.dosage);
    setReminderTime(m.reminder_time);
    setShowForm(true);
  }

  // Delete a medicine
  async function handleDelete(id: number) {
    if (!confirm("Delete this medicine?")) return;
    // Delete related history rows first, then the medicine
    await supabase.from("history").delete().eq("medicine_id", id);
    await supabase.from("medicines").delete().eq("id", id);
    await loadMedicines();
  }

  // Send a reminder email — calls the edge function
  async function sendReminder(m: Medicine) {
    try {
      setMessage("Sending reminder...");
      const { data, error } = await supabase.functions.invoke("send-reminder", {
        body: {
          medicine_name: m.medicine_name,
          dosage: m.dosage,
          reminder_time: m.reminder_time,
          user_name: user?.name,
          user_email: user?.email,
        },
      });

      if (error) throw error;
      setMessage(data?.message || `Reminder sent for ${m.medicine_name}`);
    } catch (err: any) {
      console.error("Reminder error:", err);
      setMessage(err.message || "Failed to send reminder");
    }
    setTimeout(() => setMessage(""), 5000);
  }

  // Record that the medicine was taken — inserts into History table
  async function takeMedicine(m: Medicine) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("history").insert({
        medicine_id: m.id,
        taken_date: today,
        status: "Taken",
      });

      if (error) throw error;
      setMessage(`${m.medicine_name} marked as taken`);
    } catch (err: any) {
      console.error("Take medicine error:", err);
      setMessage(err.message || "Failed to record");
    }
    setTimeout(() => setMessage(""), 4000);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setMedicineName("");
    setDosage("");
    setReminderTime("");
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Medicines</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-medium"
        >
          + Add Medicine
        </button>
      </div>

      {message && (
        <div className="mb-4 bg-teal-50 text-teal-700 p-3 rounded-md text-sm">
          {message}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3"
        >
          <h2 className="font-semibold text-gray-700">
            {editingId ? "Edit Medicine" : "Add Medicine"}
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
            <input
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
            <input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 500 mg"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Time</label>
            <input
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              placeholder="e.g. 9:00 AM"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-medium"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Medicine cards */}
      {medicines.length === 0 ? (
        <p className="text-gray-500">No medicines added yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="font-semibold text-gray-800 text-lg">{m.medicine_name}</h3>
              <p className="text-gray-600 text-sm">Dosage: {m.dosage}</p>
              <p className="text-gray-600 text-sm mb-3">Time: {m.reminder_time}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => sendReminder(m)}
                  className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 text-sm font-medium"
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => takeMedicine(m)}
                  className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 text-sm font-medium"
                >
                  Take Medicine
                </button>
                <button
                  onClick={() => startEdit(m)}
                  className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
