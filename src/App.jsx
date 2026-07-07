import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Boxes,
  Camera,
  CheckCircle2,
  Clock3,
  Factory,
  FileSearch,
  Image,
  LockKeyhole,
  LogOut,
  Mail,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: BarChart3, active: true },
  { label: "AI Assistant", icon: Bot },
  { label: "Product Search", icon: PackageSearch },
  { label: "Image Discovery", icon: Image },
];

const kpis = [
  {
    label: "Open Sales Orders",
    value: "1,500",
    delta: "+18.4%",
    icon: FileSearch,
    tone: "bg-denim",
  },
  {
    label: "Finished Goods",
    value: "1,000",
    delta: "Ready",
    icon: Boxes,
    tone: "bg-fern",
  },
  {
    label: "Invoice Coverage",
    value: "1,206",
    delta: "80.4%",
    icon: CheckCircle2,
    tone: "bg-coral",
  },
];

const workspaces = [
  {
    title: "Natural-language ERP assistant",
    description: "Ask open-ended questions across buyers, products, orders, invoices, and tech packs.",
    icon: Bot,
    action: "Ask WFX AI",
  },
  {
    title: "Intelligent product discovery",
    description: "Search style, fabric, color, print, season, category, brand, and supplier context.",
    icon: Search,
    action: "Search catalog",
  },
  {
    title: "Visual similarity search",
    description: "Upload a garment reference and find visually similar products using embeddings.",
    icon: Camera,
    action: "Upload image",
  },
];

const pipeline = [
  "Question",
  "Schema context",
  "Dynamic SQL",
  "Supabase result",
  "Business answer",
];

const productRows = [
  ["WFX-2501", "Cotton Twill", "Plum", "AW26"],
  ["WFX-2502", "Chambray", "Grey", "AW25"],
  ["WFX-3156", "Knit Blend", "Navy", "SS26"],
];

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({
    email: "merchandiser@wfx.com",
    password: "demo1234",
  });
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.includes("@") || form.password.length < 6) {
      setError("Use a valid work email and a password with at least 6 characters.");
      return;
    }

    setError("");
    onLogin({
      email: form.email,
      name: form.email.split("@")[0],
      role: "Merchandiser",
    });
  }

  return (
    <main className="min-h-screen bg-[#eef3f4] text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(31,95,139,0.45),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(217,111,93,0.28),transparent_30%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-ink">
                <Sparkles aria-hidden="true" size={24} />
              </div>
              <div>
                <p className="font-semibold">WFX AI ERP</p>
                <p className="text-sm text-slate-300">Secure fashion operations workspace</p>
              </div>
            </div>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 max-w-2xl"
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.45 }}
            >
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
                <ShieldCheck aria-hidden="true" size={15} />
                Protected ERP access
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-tight">
                Sign in before exploring buyers, orders, invoices, and product intelligence.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                The MVP starts with a local login gate. Backend token auth and Supabase
                role-based access will be connected with the API security milestone.
              </p>
            </motion.div>
          </div>

          <div className="relative grid gap-3 md:grid-cols-3">
            {["AI SQL", "Typesense", "Image search"].map((item) => (
              <div className="rounded-xl border border-white/10 bg-white/8 p-4" key={item}>
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">Access controlled workspace</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <motion.form
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            initial={{ opacity: 0, y: 16 }}
            onSubmit={handleSubmit}
            transition={{ duration: 0.35 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
              <LockKeyhole aria-hidden="true" size={22} />
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-ink">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sign in to access the WFX AI ERP command center.
            </p>

            <label className="mt-7 block text-sm font-semibold text-ink" htmlFor="email">
              Work email
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 focus-within:border-denim focus-within:ring-2 focus-within:ring-denim/15">
              <Mail aria-hidden="true" className="text-slate-400" size={18} />
              <input
                className="w-full border-0 bg-transparent text-sm text-ink outline-none"
                id="email"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                type="email"
                value={form.email}
              />
            </div>

            <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="password">
              Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 focus-within:border-denim focus-within:ring-2 focus-within:ring-denim/15">
              <LockKeyhole aria-hidden="true" className="text-slate-400" size={18} />
              <input
                className="w-full border-0 bg-transparent text-sm text-ink outline-none"
                id="password"
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                type="password"
                value={form.password}
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p>
            ) : null}

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              <ShieldCheck aria-hidden="true" size={18} />
              Sign in securely
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Demo credentials are prefilled for evaluation. This is a local MVP gate,
              not a replacement for backend authentication.
            </p>
          </motion.form>
        </section>
      </div>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("wfx-demo-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  function handleLogin(nextUser) {
    sessionStorage.setItem("wfx-demo-user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function handleLogout() {
    sessionStorage.removeItem("wfx-demo-user");
    setUser(null);
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-[#eef3f4] text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
              <Sparkles aria-hidden="true" size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">WFX AI ERP</p>
              <p className="text-xs text-slate-500">Fashion operations</p>
            </div>
          </div>

          <nav className="mt-9 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                    item.active
                      ? "bg-ink text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  }`}
                  key={item.label}
                  type="button"
                >
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-slate-200 bg-mist p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-denim">
                <UserRound aria-hidden="true" size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Clock3 aria-hidden="true" size={16} />
              MVP build track
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Backend APIs first, then dashboard, assistant, search, and visual discovery.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-denim">
                  AI-native apparel ERP
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-ink md:text-3xl">
                  Command center for merchandisers and analysts
                </h1>
              </div>
              <button className="inline-flex w-fit items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                <Sparkles aria-hidden="true" size={17} />
                Launch assistant
              </button>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                onClick={handleLogout}
                type="button"
              >
                <LogOut aria-hidden="true" size={17} />
                Sign out
              </button>
            </div>
          </header>

          <div className="grid flex-1 gap-5 px-5 py-5 md:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <motion.section
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-xl bg-ink text-white shadow-sm"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.45 }}
              >
                <div className="grid gap-6 p-6 md:grid-cols-[1fr_320px] md:p-8">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
                      <Factory aria-hidden="true" size={15} />
                      Supabase, Vanna AI, OpenRouter, Typesense
                    </div>
                    <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
                      Turn ERP data into instant answers, product discovery, and visual search.
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                      Built for fashion teams who need buyer, supplier, style, order, invoice,
                      and technical product insights without writing SQL.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/8 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-200">AI SQL workflow</p>
                      <TrendingUp aria-hidden="true" className="text-coral" size={18} />
                    </div>
                    <div className="mt-5 space-y-3">
                      {pipeline.map((step, index) => (
                        <motion.div
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2"
                          initial={{ opacity: 0, x: 16 }}
                          key={step}
                          transition={{ delay: index * 0.08, duration: 0.35 }}
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-ink">
                            {index + 1}
                          </span>
                          <span className="text-sm text-slate-100">{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              <section className="grid gap-4 md:grid-cols-3">
                {kpis.map((kpi, index) => {
                  const Icon = kpi.icon;

                  return (
                    <motion.article
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                      initial={{ opacity: 0, y: 12 }}
                      key={kpi.label}
                      transition={{ delay: 0.12 + index * 0.06, duration: 0.35 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${kpi.tone} text-white`}>
                          <Icon aria-hidden="true" size={21} />
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {kpi.delta}
                        </span>
                      </div>
                      <p className="mt-5 text-sm font-medium text-slate-500">{kpi.label}</p>
                      <p className="mt-1 text-3xl font-semibold text-ink">{kpi.value}</p>
                    </motion.article>
                  );
                })}
              </section>

              <section className="grid gap-5 xl:grid-cols-3">
                {workspaces.map((workspace, index) => {
                  const Icon = workspace.icon;

                  return (
                    <motion.article
                      animate={{ opacity: 1, y: 0 }}
                      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      initial={{ opacity: 0, y: 12 }}
                      key={workspace.title}
                      transition={{ delay: 0.24 + index * 0.07, duration: 0.35 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-denim">
                          <Icon aria-hidden="true" size={22} />
                        </div>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="text-slate-400 transition group-hover:text-ink"
                          size={19}
                        />
                      </div>
                      <h2 className="mt-5 text-lg font-semibold text-ink">{workspace.title}</h2>
                      <p className="mt-2 min-h-20 text-sm leading-6 text-slate-600">
                        {workspace.description}
                      </p>
                      <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-denim">
                        {workspace.action}
                        <ArrowUpRight aria-hidden="true" size={15} />
                      </button>
                    </motion.article>
                  );
                })}
              </section>
            </div>

            <aside className="space-y-5">
              <motion.section
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                initial={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink">Ask ERP data</h2>
                  <Bot aria-hidden="true" className="text-denim" size={21} />
                </div>
                <div className="mt-4 rounded-xl bg-mist p-4">
                  <p className="text-sm leading-6 text-slate-700">
                    Which buyers have the highest shipped order value this season?
                  </p>
                </div>
                <div className="mt-3 rounded-xl bg-ink p-4 text-sm leading-6 text-white">
                  Vanna will inspect schema context, generate safe SQL, query Supabase,
                  and return an analyst-ready answer.
                </div>
              </motion.section>

              <motion.section
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                initial={{ opacity: 0, x: 18 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink">Product index</h2>
                  <PackageSearch aria-hidden="true" className="text-fern" size={21} />
                </div>
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  {productRows.map((row) => (
                    <div
                      className="grid grid-cols-[82px_1fr_64px_56px] gap-3 border-b border-slate-200 px-3 py-3 text-xs last:border-b-0"
                      key={row[0]}
                    >
                      {row.map((cell) => (
                        <span className="truncate text-slate-600" key={cell}>
                          {cell}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                initial={{ opacity: 0, x: 18 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink">Image discovery</h2>
                  <Image aria-hidden="true" className="text-coral" size={21} />
                </div>
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <Camera aria-hidden="true" className="mx-auto text-slate-400" size={30} />
                  <p className="mt-3 text-sm font-semibold text-ink">Drop garment reference</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    CLIP embeddings and Typesense vector search connect in the image milestone.
                  </p>
                </div>
              </motion.section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
