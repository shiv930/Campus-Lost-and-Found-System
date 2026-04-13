import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { CATEGORIES } from "../api.js";

export default function ReportFound() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    itemName: "",
    category: CATEGORIES[0],
    description: "",
    locationFound: "",
    dateFound: "",
    hiddenIdentifier: "",
  });
  const [image, setImage] = useState(null);
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
      const body = new FormData();
      body.append("itemName", form.itemName);
      body.append("category", form.category);
      body.append("description", form.description);
      body.append("locationFound", form.locationFound);
      body.append("dateFound", form.dateFound);
      body.append("hiddenIdentifier", form.hiddenIdentifier);
      if (image) body.append("image", image);

      await api.post("/api/found", body);
      navigate("/matches");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to report a found item.");
      } else {
        setError(err.response?.data?.message || "Could not submit");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="opacity-0 animate-fadeUp">
        <h1 className="font-display text-3xl font-bold text-bgi-navy">Report found item</h1>
        <p className="text-slate-600 mt-2">
          Add a <strong>hidden identifier</strong> only the real owner would know. It is stored
          securely and never shown on the website.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item name</label>
            <input
              required
              value={form.itemName}
              onChange={(e) => update("itemName", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location found</label>
            <input
              required
              value={form.locationFound}
              onChange={(e) => update("locationFound", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date found</label>
            <input
              type="date"
              required
              value={form.dateFound}
              onChange={(e) => update("dateFound", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-teal-50 file:text-teal-700"
            />
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <label className="block text-sm font-semibold text-amber-900 mb-1">
              Hidden identifier (secret)
            </label>
            <input
              required
              value={form.hiddenIdentifier}
              onChange={(e) => update("hiddenIdentifier", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
              placeholder="e.g. lock screen text, engraving, SIM operator"
            />
            <p className="text-xs text-amber-800 mt-2">
              This is compared exactly when someone claims the item. Never share it publicly.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 transition-all"
          >
            {loading ? "Saving…" : "Submit found item"}
          </button>
        </form>
      </div>
    </div>
  );
}
