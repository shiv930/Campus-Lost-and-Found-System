import { useEffect, useState, useCallback } from "react";
import api from "../api.js";
import { resolveUploadUrl } from "../utils/imageUrl.js";

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    lostQ: "",
    foundQ: "",
    claimStatus: "",
    itemStatus: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = new URLSearchParams();
      if (filters.lostQ) p.set("lostQ", filters.lostQ);
      if (filters.foundQ) p.set("foundQ", filters.foundQ);
      if (filters.claimStatus) p.set("claimStatus", filters.claimStatus);
      if (filters.itemStatus) p.set("itemStatus", filters.itemStatus);
      const res = await api.get(`/api/admin/all?${p}`);
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateClaim(id, status) {
    try {
      await api.patch(`/api/admin/claims/${id}`, { status });
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    }
  }

  async function markReturned(type, id) {
    try {
      await api.patch(`/api/admin/items/${type}/${id}`, {});
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    }
  }

  if (loading && !data) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-slate-500">Loading dashboard…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="opacity-0 animate-fadeUp">
        <h1 className="font-display text-3xl font-bold text-bgi-navy">Admin dashboard</h1>
        <p className="text-slate-600 mt-1">Search, review claims, and update item status.</p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.stats && (
            <>
              <Stat label="Registered users" value={data.stats.users} />
              <Stat label="Lost reports" value={data.stats.lostCount} />
              <Stat label="Found items" value={data.stats.foundCount} />
              <Stat label="Claims" value={data.stats.claimsCount} />
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Filter lost (search)</label>
            <input
              value={filters.lostQ}
              onChange={(e) => setFilters((f) => ({ ...f, lostQ: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-44"
              placeholder="Lost search"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Filter found (search)</label>
            <input
              value={filters.foundQ}
              onChange={(e) => setFilters((f) => ({ ...f, foundQ: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-44"
              placeholder="Found search"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Claim status</label>
            <select
              value={filters.claimStatus}
              onChange={(e) => setFilters((f) => ({ ...f, claimStatus: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Item list status</label>
            <select
              value={filters.itemStatus}
              onChange={(e) => setFilters((f) => ({ ...f, itemStatus: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="matched">Matched</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-bgi-navy mb-4">Claims</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Claimant</th>
                  <th className="p-3">Lost</th>
                  <th className="p-3">Found</th>
                  <th className="p-3">Explanation</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.claims?.map((c) => (
                  <tr key={c._id} className="border-t border-slate-100 align-top">
                    <td className="p-3">
                      <span
                        className={`font-semibold text-xs px-2 py-1 rounded-full ${
                          c.status === "approved"
                            ? "bg-teal-100 text-teal-800"
                            : c.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.autoVerified && (
                        <span className="block text-xs text-slate-400 mt-1">Auto</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">
                      {c.claimant?.name}
                      <br />
                      <span className="text-xs text-slate-400">{c.claimant?.email}</span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-[140px]">{c.lostItem?.itemName}</td>
                    <td className="p-3 text-slate-700 max-w-[140px]">{c.foundItem?.itemName}</td>
                    <td className="p-3 text-slate-600 max-w-xs whitespace-pre-wrap">
                      {c.explanation}
                    </td>
                    <td className="p-3 space-y-1">
                      {c.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => updateClaim(c._id, "approved")}
                          className="block w-full py-1 rounded bg-teal-600 text-white text-xs font-medium hover:bg-teal-700"
                        >
                          Approve
                        </button>
                      )}
                      {c.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => updateClaim(c._id, "rejected")}
                          className="block w-full py-1 rounded bg-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-300"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.claims?.length === 0 && (
              <p className="p-6 text-center text-slate-500">No claims.</p>
            )}
          </div>
        </section>

        <div className="mt-12 grid lg:grid-cols-2 gap-10">
          <section>
            <h2 className="font-display text-xl font-bold text-bgi-navy mb-4">Lost items</h2>
            <ul className="space-y-3">
              {data?.lostItems?.map((item) => (
                <li
                  key={item._id}
                  className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-bgi-navy">{item.itemName}</p>
                    <p className="text-xs text-slate-500">{item.status}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.contactInfo}</p>
                  </div>
                  {item.status !== "returned" && (
                    <button
                      type="button"
                      onClick={() => markReturned("lost", item._id)}
                      className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 shrink-0"
                    >
                      Mark returned
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-bgi-navy mb-4">Found items</h2>
            <ul className="space-y-3">
              {data?.foundItems?.map((item) => (
                <li
                  key={item._id}
                  className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex gap-3"
                >
                  {item.imageUrl && (
                    <img
                      src={resolveUploadUrl(item.imageUrl)}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-bgi-navy truncate">{item.itemName}</p>
                    <p className="text-xs text-slate-500">{item.status}</p>
                  </div>
                  {item.status !== "returned" && (
                    <button
                      type="button"
                      onClick={() => markReturned("found", item._id)}
                      className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 self-center shrink-0"
                    >
                      Returned
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-md hover:shadow-lg transition-shadow">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-display text-3xl font-bold text-bgi-navy mt-1">{value}</p>
    </div>
  );
}
