import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-bgi-navy via-slate-900 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl opacity-0 animate-fadeUp">
            <p className="text-teal-300 font-medium tracking-wide uppercase text-sm mb-3">
              Bansal Group of Institutes
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Campus Lost &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Found
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Report lost belongings, upload found items securely, and let smart matching connect the
              right owner — without ever exposing private verification details on the web.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/report-lost"
                className="inline-flex justify-center items-center px-6 py-3.5 rounded-xl bg-white text-bgi-navy font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                I lost something
              </Link>
              <Link
                to="/report-found"
                className="inline-flex justify-center items-center px-6 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all duration-300"
              >
                I found something
              </Link>
            </div>
            {!isAuthenticated && (
              <p className="mt-8 text-sm text-slate-400">
                <Link to="/register" className="text-teal-300 hover:underline">
                  Create an account
                </Link>{" "}
                to post reports and track matches.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-bgi-navy text-center mb-12">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Report",
              body: "Log a lost item with details, or a found item with a secret only you know.",
            },
            {
              step: "2",
              title: "Match",
              body: "Our system suggests possible pairs based on name, category, and location.",
            },
            {
              step: "3",
              title: "Claim",
              body: "Owners verify ownership with the hidden identifier. Admins can assist if needed.",
            },
          ].map((card, i) => (
            <div
              key={card.step}
              className={`bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fadeUp stagger-${i + 1}`}
              style={{ animationFillMode: "forwards" }}
            >
              <span className="inline-flex w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-display font-bold items-center justify-center mb-4">
                {card.step}
              </span>
              <h3 className="font-display text-xl font-semibold text-bgi-navy">{card.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
