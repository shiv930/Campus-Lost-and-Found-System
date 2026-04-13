import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { CATEGORIES } from "../api.js";

export default function ReportLost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    itemName: "",
    category: CATEGORIES[0],
    description: "",
    locationLost: "",
    dateLost: "",
    contactInfo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/lost", form);
      if (data.lostItem?._id) {
        navigate(`/matches/${data.lostItem._id}`, {
          state: { initialMatches: data.suggestedMatches, lostItem: data.lostItem },
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to report a lost item.");
      } else {
        setError(err.response?.data?.message || "Could not submit report");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="opacity-0 animate-fadeUp">
        <h1 className="font-display text-3xl font-bold text-bgi-navy">Report lost item</h1>
        <p className="text-slate-600 mt-2">
          Provide accurate details. We will suggest possible matches from found reports.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item name</label>
            <input
              required
              value={form.itemName}
              onChange={(e) => update("itemName", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="e.g. Samsung Galaxy phone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-y"
              placeholder="Color, distinguishing marks…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location lost</label>
            <input
              required
              value={form.locationLost}
              onChange={(e) => update("locationLost", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Building, block, or area"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date lost</label>
            <input
              type="date"
              required
              value={form.dateLost}
              onChange={(e) => update("dateLost", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact info</label>
            <input
              required
              value={form.contactInfo}
              onChange={(e) => update("contactInfo", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Phone or email reachable by campus desk"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-bgi-navy text-white font-semibold hover:bg-slate-800 disabled:opacity-60 transition-all"
          >
            {loading ? "Submitting…" : "Submit & find matches"}
          </button>
        </form>

      </div>
    </div>
  );
}
