import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api.js";
import { resolveUploadUrl } from "../utils/imageUrl.js";

export default function MatchDetail() {
  const { lostId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data: res } = await api.get(`/api/match/${lostId}`);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load matches");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (lostId) load();
    return () => {
      cancelled = true;
    };
  }, [lostId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-slate-500">Loading matches…</div>
    );
  }
  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-red-600">{error || "Not found"}</p>
        <Link to="/matches" className="text-teal-600 mt-4 inline-block hover:underline">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const { lostItem, matches } = data;
  const strong = matches.filter((m) => m.isLikelyMatch);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="opacity-0 animate-fadeUp">
        <Link to="/matches" className="text-sm text-teal-600 hover:underline mb-6 inline-block">
          ← All reports
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 sm:p-8 mb-10">
          <h1 className="font-display text-2xl font-bold text-bgi-navy">Your lost report</h1>
          <p className="text-xl font-semibold text-slate-800 mt-4">{lostItem.itemName}</p>
          <p className="text-sm text-slate-500">{lostItem.category}</p>
          <p className="text-slate-600 mt-3">{lostItem.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="text-slate-500">
              <strong className="text-slate-700">Where:</strong> {lostItem.locationLost}
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                lostItem.status === "returned"
                  ? "bg-slate-100 text-slate-600"
                  : lostItem.status === "matched"
                    ? "bg-teal-100 text-teal-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {lostItem.status}
            </span>
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-bgi-navy mb-2">Suggested matches</h2>
        <p className="text-slate-600 text-sm mb-6">
          Ranked by similarity. The real owner proves identity with the hidden detail — never shown
          here.
        </p>

        {strong.length === 0 && (
          <p className="text-slate-500 mb-6">
            No high-confidence matches right now. You can still try claiming an item below if you
            recognize it.
          </p>
        )}

        <ul className="grid gap-6 lg:grid-cols-2">
          {matches.map((m) => (
            <li
              key={m.foundItem._id}
              className={`rounded-2xl border shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${
                m.isLikelyMatch
                  ? "border-teal-200 ring-2 ring-teal-100"
                  : "border-slate-100 opacity-90"
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                {m.foundItem.imageUrl ? (
                  <img
                    src={resolveUploadUrl(m.foundItem.imageUrl)}
                    alt=""
                    className="sm:w-44 h-44 object-cover shrink-0"
                  />
                ) : (
                  <div className="sm:w-44 h-44 bg-slate-100 flex items-center justify-center text-slate-400 text-sm shrink-0">
                    No image
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold text-lg text-bgi-navy">
                      {m.foundItem.itemName}
                    </h3>
                    {m.isLikelyMatch && (
                      <span className="text-xs font-bold uppercase tracking-wide text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Likely match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{m.foundItem.category}</p>
                  <p className="text-sm text-slate-600 mt-2 flex-1">{m.foundItem.description}</p>
                  <p className="text-xs text-slate-500 mt-2">{m.foundItem.locationFound}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Score: {m.matchScore}{" "}
                    <span className="hidden sm:inline">
                      (name {Math.round(m.breakdown.nameSim * 100)}%, loc{" "}
                      {Math.round(m.breakdown.locSim * 100)}%)
                    </span>
                  </p>
                  <Link
                    to={`/claim?lostId=${lostId}&foundId=${m.foundItem._id}`}
                    className="mt-4 inline-flex justify-center items-center py-2.5 rounded-xl bg-bgi-navy text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Start claim
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
