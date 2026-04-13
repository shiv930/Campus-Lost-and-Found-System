import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api.js";

export default function Claim() {
  const [params] = useSearchParams();
  const lostId = params.get("lostId");
  const foundId = params.get("foundId");
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState("");
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/claim", {
        lostItemId: lostId,
        foundItemId: foundId,
        explanation,
        hiddenIdentifierGuess: guess,
      });
      setMessage(data.message);
      if (data.claim?.status === "approved") {
        setTimeout(() => navigate("/matches"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Claim failed");
    } finally {
      setLoading(false);
    }
  }

  if (!lostId || !foundId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Missing item references.</p>
        <Link to="/matches" className="text-teal-600 mt-4 inline-block hover:underline">
          Go to matches
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="opacity-0 animate-fadeUp bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-bgi-navy">Claim item</h1>
        <p className="text-slate-600 text-sm mt-2">
          Explain why this is yours, then enter the <strong>exact</strong> hidden detail the finder
          set (case-sensitive match).
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
            {error}
          </div>
        )}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm border ${
              message.includes("approved")
                ? "bg-teal-50 text-teal-900 border-teal-100"
                : "bg-amber-50 text-amber-900 border-amber-100"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Explanation</label>
            <textarea
              required
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-y"
              placeholder="Why this item belongs to you…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hidden identifier (your guess)
            </label>
            <input
              required
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Must match exactly what the finder saved"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit claim"}
          </button>
        </form>

        <Link
          to={`/matches/${lostId}`}
          className="block text-center text-sm text-teal-600 mt-6 hover:underline"
        >
          ← Back to match list
        </Link>
      </div>
    </div>
  );
}
