import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { CATEGORIES } from "../api.js";
import { resolveUploadUrl } from "../utils/imageUrl.js";

export default function MatchesHub() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [lostFilters, setLostFilters] = useState({ q: "", status: "", category: "" });
  const [foundFilters, setFoundFilters] = useState({ q: "", status: "", category: "" });
  const [tab, setTab] = useState("lost");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const paramsLost = new URLSearchParams();
        if (lostFilters.q) paramsLost.set("q", lostFilters.q);
        if (lostFilters.status) paramsLost.set("status", lostFilters.status);
        if (lostFilters.category) paramsLost.set("category", lostFilters.category);

        const paramsFound = new URLSearchParams();
        if (foundFilters.q) paramsFound.set("q", foundFilters.q);
        if (foundFilters.status) paramsFound.set("status", foundFilters.status);
        if (foundFilters.category) paramsFound.set("category", foundFilters.category);

        const [lostRes, foundRes] = await Promise.all([
          api.get(`/api/lost/mine?${paramsLost}`).catch(() => ({ data: [] })),
          api.get(`/api/found/browse?${paramsFound}`),
        ]);
        if (!cancelled) {
          setLostItems(lostRes.data);
          setFoundItems(foundRes.data);
        }
      } catch (e) {
        if (!cancelled) {
          if (e.response?.status === 401) {
            setError("Log in to see your lost reports.");
            setLostItems([]);
          } else setError(e.response?.data?.message || "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [lostFilters, foundFilters]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="opacity-0 animate-fadeUp">
        <h1 className="font-display text-3xl font-bold text-bgi-navy">Matches & listings</h1>
        <p className="text-slate-600 mt-2">
          Open a lost report to run smart matching, or browse found items on campus.
        </p>

        <div className="mt-8 flex gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setTab("lost")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "lost" ? "bg-white shadow text-bgi-navy" : "text-slate-600"
            }`}
          >
            My lost reports
          </button>
          <button
            type="button"
            onClick={() => setTab("found")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "found" ? "bg-white shadow text-bgi-navy" : "text-slate-600"
            }`}
          >
            Found items (browse)
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 text-amber-900 text-sm border border-amber-100">
            {error}
          </div>
        )}

        {tab === "lost" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                placeholder="Search…"
                value={lostFilters.q}
                onChange={(e) => setLostFilters((f) => ({ ...f, q: e.target.value }))}
                className="flex-1 min-w-[160px] px-4 py-2 rounded-xl border border-slate-200"
              />
              <select
                value={lostFilters.status}
                onChange={(e) => setLostFilters((f) => ({ ...f, status: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="matched">Matched</option>
                <option value="returned">Returned</option>
              </select>
              <select
                value={lostFilters.category}
                onChange={(e) => setLostFilters((f) => ({ ...f, category: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading…</p>
            ) : lostItems.length === 0 ? (
              <p className="text-slate-500">
                No reports yet.{" "}
                <Link to="/report-lost" className="text-teal-600 font-medium hover:underline">
                  Report a lost item
                </Link>
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {lostItems.map((item) => (
                  <li
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h2 className="font-display font-semibold text-lg text-bgi-navy">
                        {item.itemName}
                      </h2>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                          item.status === "returned"
                            ? "bg-slate-100 text-slate-600"
                            : item.status === "matched"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{item.category}</p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{item.description}</p>
                    <Link
                      to={`/matches/${item._id}`}
                      className="inline-block mt-4 text-sm font-semibold text-teal-600 hover:underline"
                    >
                      View matches →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "found" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                placeholder="Search found items…"
                value={foundFilters.q}
                onChange={(e) => setFoundFilters((f) => ({ ...f, q: e.target.value }))}
                className="flex-1 min-w-[160px] px-4 py-2 rounded-xl border border-slate-200"
              />
              <select
                value={foundFilters.status}
                onChange={(e) => setFoundFilters((f) => ({ ...f, status: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Active (pending + matched)</option>
                <option value="pending">Pending</option>
                <option value="matched">Matched</option>
                <option value="returned">Returned</option>
              </select>
              <select
                value={foundFilters.category}
                onChange={(e) => setFoundFilters((f) => ({ ...f, category: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading…</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {foundItems.map((item) => (
                  <li
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {item.imageUrl ? (
                      <img
                        src={resolveUploadUrl(item.imageUrl)}
                        alt=""
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        No photo
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="font-display font-semibold text-bgi-navy">{item.itemName}</h2>
                      <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-2">{item.locationFound}</p>
                      <span
                        className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${
                          item.status === "returned"
                            ? "bg-slate-100 text-slate-600"
                            : item.status === "matched"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!loading && foundItems.length === 0 && (
              <p className="text-slate-500">No found items match your filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
