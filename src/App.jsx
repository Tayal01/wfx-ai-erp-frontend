import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Factory,
  FileSpreadsheet,
  Filter,
  LockKeyhole,
  LogOut,
  Mail,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  clearSession,
  getDashboardSummary,
  getMe,
  getProductDetail,
  getProducts,
  getStoredToken,
  getStoredUser,
  login,
  persistSession,
} from "./api.js";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "Products", icon: PackageSearch },
  { id: "assistant", label: "AI Assistant", icon: Bot },
];

const defaultFilters = {
  category: "",
  color: "",
  fabric: "",
  season: "",
  supplier: "",
};

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function LoginScreen({ onLogin, loading }) {
  const [form, setForm] = useState({
    email: "merchandiser@wfx.com",
    password: "demo1234",
  });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Enter the demo work email and password to continue.");
      return;
    }

    setError("");

    try {
      await onLogin(form);
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in.");
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe8_0%,#f5f7f7_48%,#edf3f2_100%)] text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_480px]">
        <section className="relative hidden overflow-hidden bg-[#102227] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,121,60,0.30),transparent_30%),radial-gradient(circle_at_75%_10%,rgba(90,157,118,0.28),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4efe8] text-[#102227]">
                <Sparkles aria-hidden="true" size={24} />
              </div>
              <div>
                <p className="font-semibold tracking-wide">WFX AI ERP</p>
                <p className="text-sm text-slate-300">Protected operations workspace</p>
              </div>
            </div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 max-w-3xl"
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.45 }}
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm text-slate-200">
                <ShieldCheck aria-hidden="true" size={15} />
                Backend JWT login active
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-tight">
                Sign in to reach the live ERP APIs, not just a demo shell.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                This frontend now authenticates against FastAPI, holds a bearer token,
                and loads protected dashboard and product data from Supabase-backed routes.
              </p>
            </motion.div>
          </div>

          <div className="relative grid gap-4 md:grid-cols-3">
            {[
              ["JWT Auth", "POST /api/auth/login"],
              ["Dashboard API", "GET /api/dashboard/summary"],
              ["Products API", "GET /api/products"],
            ].map(([title, copy]) => (
              <div className="rounded-2xl border border-white/10 bg-white/7 p-4" key={title}>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <motion.form
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-[28px] border border-[#d7dedc] bg-white/90 p-7 shadow-[0_24px_80px_rgba(16,34,39,0.10)] backdrop-blur"
            initial={{ opacity: 0, y: 16 }}
            onSubmit={handleSubmit}
            transition={{ duration: 0.35 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
              <LockKeyhole aria-hidden="true" size={22} />
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-ink">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the backend demo account to unlock the live ERP dashboard.
            </p>

            <label className="mt-7 block text-sm font-semibold text-ink" htmlFor="email">
              Work email
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfcfb] px-3 py-3 focus-within:border-[#d9773f] focus-within:ring-2 focus-within:ring-[#d9773f]/15">
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
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfcfb] px-3 py-3 focus-within:border-[#d9773f] focus-within:ring-2 focus-within:ring-[#d9773f]/15">
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
              <p className="mt-4 rounded-xl bg-[#ef8f5a]/12 px-3 py-2 text-sm text-[#c75a24]">
                {error}
              </p>
            ) : null}

            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#102227] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17333a] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              <ShieldCheck aria-hidden="true" size={18} />
              {loading ? "Signing in..." : "Sign in securely"}
            </button>

            <div className="mt-5 rounded-2xl bg-[#f4efe8] p-4 text-xs leading-5 text-slate-600">
              This now uses the backend auth API. The default demo credentials match the
              backend `.env` values.
            </div>
          </motion.form>
        </section>
      </div>
    </main>
  );
}

function DashboardView({ summary, loading }) {
  const kpis = summary?.kpis;
  const charts = summary?.charts;
  const recent = summary?.recent;

  const cards = [
    {
      label: "Sales orders",
      value: kpis ? formatCompactNumber(kpis.sales_orders) : "--",
      detail: "Protected ERP order ledger",
      icon: ClipboardList,
      tone: "bg-[#12323a]",
    },
    {
      label: "Finished goods",
      value: kpis ? formatCompactNumber(kpis.finished_goods) : "--",
      detail: "Searchable product catalog",
      icon: Boxes,
      tone: "bg-[#4b8b69]",
    },
    {
      label: "Invoice amount",
      value: kpis ? formatCurrency(kpis.invoice_amount) : "--",
      detail: "Live invoice totals",
      icon: FileSpreadsheet,
      tone: "bg-[#d9773f]",
    },
    {
      label: "Pending invoices",
      value: kpis ? formatCurrency(kpis.pending_invoice_amount) : "--",
      detail: "Requires follow-up",
      icon: CheckCircle2,
      tone: "bg-[#b44e46]",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[28px] bg-[#102227] text-white shadow-[0_24px_80px_rgba(16,34,39,0.16)]"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.45 }}
      >
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm text-slate-200">
              <Factory aria-hidden="true" size={15} />
              Live dashboard summary API
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
              Protected ERP metrics, product inventory, and invoice movement in one place.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              The screen below is backed by `GET /api/dashboard/summary` and `GET /api/products`,
              using the JWT token from the backend login flow.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/7 p-5">
            <p className="text-sm font-medium text-slate-200">AI flow next</p>
            <div className="mt-4 space-y-3">
              {["Login", "Dashboard API", "Products API", "AI SQL route"].map((step, index) => (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2"
                  initial={{ opacity: 0, x: 14 }}
                  key={step}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-xs font-semibold text-[#102227]">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-100">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)]"
              initial={{ opacity: 0, y: 10 }}
              key={card.label}
              transition={{ delay: index * 0.06, duration: 0.3 }}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone} text-white`}>
                  <Icon aria-hidden="true" size={20} />
                </div>
                <span className="rounded-full bg-[#f4efe8] px-2.5 py-1 text-xs font-semibold text-slate-600">
                  Live
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-1 text-3xl font-semibold text-ink">
                {loading ? "..." : card.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Top buyers by revenue</h3>
            <BarChart3 aria-hidden="true" className="text-[#d9773f]" size={20} />
          </div>
          <div className="mt-5 space-y-3">
            {(charts?.top_buyers || []).slice(0, 6).map((buyer, index) => (
              <div className="grid grid-cols-[1fr_110px] items-center gap-4" key={buyer.buyer}>
                <div>
                  <div className="flex items-center justify-between text-sm font-medium text-ink">
                    <span className="truncate">{buyer.buyer}</span>
                    <span className="ml-4 text-slate-500">{formatCurrency(buyer.revenue)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#eef3f2]">
                    <div
                      className="h-2 rounded-full bg-[#d9773f]"
                      style={{
                        width: `${Math.max(18, 100 - index * 12)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Category mix</h3>
            <Tag aria-hidden="true" className="text-[#4b8b69]" size={20} />
          </div>
          <div className="mt-5 space-y-3">
            {(charts?.product_categories || []).slice(0, 5).map((item) => (
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f9f8] px-3 py-3" key={item.category}>
                <span className="text-sm font-medium text-ink">{item.category}</span>
                <span className="text-sm text-slate-500">{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)]">
          <h3 className="text-lg font-semibold text-ink">Recent products</h3>
          <div className="mt-4 space-y-3">
            {(recent?.products || []).slice(0, 6).map((product) => (
              <div className="rounded-2xl border border-slate-100 px-4 py-3" key={product.style_number}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{product.style_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {product.style_number} · {product.category} · {product.color}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef3f2] px-3 py-1 text-xs font-semibold text-slate-600">
                    {product.season}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)]">
          <h3 className="text-lg font-semibold text-ink">Recent orders</h3>
          <div className="mt-4 space-y-3">
            {(recent?.orders || []).slice(0, 6).map((order) => (
              <div className="rounded-2xl border border-slate-100 px-4 py-3" key={order.order_number}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{order.buyer}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.order_number} · {order.style_number} · Qty {order.quantity}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-semibold text-slate-600">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function ProductsView({
  filters,
  onFilterChange,
  onPageChange,
  page,
  products,
  productsLoading,
  selectedProduct,
  selectedProductLoading,
  onProductSelect,
  productDetailError,
  productsError,
}) {
  const totalPages = Math.max(1, Math.ceil((products?.total || 0) / (products?.page_size || 8)));

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-5">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Product discovery</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Live results from `GET /api/products` with backend auth and filterable ERP catalog data.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4efe8] px-3 py-2 text-sm font-semibold text-slate-700">
              <Filter aria-hidden="true" size={16} />
              {products?.total || 0} products
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["category", "Category"],
              ["color", "Color"],
              ["fabric", "Fabric"],
              ["season", "Season"],
              ["supplier", "Supplier"],
            ].map(([key, label]) => (
              <label className="block" key={key}>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfb] px-3 py-3 text-sm text-ink outline-none transition focus:border-[#d9773f] focus:ring-2 focus:ring-[#d9773f]/15"
                  onChange={(event) => onFilterChange(key, event.target.value)}
                  placeholder={`Filter by ${label.toLowerCase()}`}
                  value={filters[key]}
                />
              </label>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)]">
          {productsError ? (
            <div className="mb-4 rounded-2xl bg-[#ef8f5a]/10 px-4 py-3 text-sm text-[#b65a29]">
              {productsError}
            </div>
          ) : null}

          <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1">
            {(products?.items || []).map((product) => (
              <button
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  selectedProduct?.product?.style_number === product.style_number
                    ? "border-[#d9773f] bg-[#fff9f3]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-[#fbfcfb]"
                }`}
                key={product.style_number}
                onClick={() => onProductSelect(product.style_number)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{product.style_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {product.style_number} · {product.category} · {product.fabric}
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      {product.color} · {product.print} · {product.supplier}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef3f2] px-3 py-1 text-xs font-semibold text-slate-600">
                    {product.season}
                  </span>
                </div>
              </button>
            ))}

            {productsLoading ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                Loading products from the protected API...
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
              disabled={page <= 1 || productsLoading}
              onClick={() => onPageChange(page - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={16} />
              Previous
            </button>
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
              disabled={page >= totalPages || productsLoading}
              onClick={() => onPageChange(page + 1)}
              type="button"
            >
              Next
              <ChevronRight aria-hidden="true" size={16} />
            </button>
          </div>
        </article>
      </section>

      <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(16,34,39,0.06)] xl:sticky xl:top-6 xl:self-start">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Product detail</h3>
          <ArrowRight aria-hidden="true" className="text-[#d9773f]" size={18} />
        </div>

        {productDetailError ? (
          <div className="mt-5 rounded-2xl bg-[#ef8f5a]/10 px-4 py-3 text-sm text-[#b65a29]">
            {productDetailError}
          </div>
        ) : null}

        {selectedProductLoading ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            Loading product detail...
          </div>
        ) : null}

        {selectedProduct ? (
          <div className="mt-5 space-y-5">
            <div className="rounded-[24px] bg-[#102227] p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                {selectedProduct.product.style_number}
              </p>
              <h4 className="mt-2 text-2xl font-semibold">{selectedProduct.product.style_name}</h4>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {selectedProduct.product.category} · {selectedProduct.product.fabric} · {selectedProduct.product.color}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Supplier", selectedProduct.product.supplier],
                ["Season", selectedProduct.product.season],
                ["Brand", selectedProduct.product.brand],
                ["Selling price", formatCurrency(selectedProduct.product.selling_price)],
              ].map(([label, value]) => (
                <div className="rounded-2xl bg-[#f7f9f8] p-4" key={label}>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-ink">Tech pack</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedProduct.tech_pack?.fabric_details || "No tech pack details found."}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {selectedProduct.tech_pack?.construction || "Construction unavailable"} ·{" "}
                {selectedProduct.tech_pack?.wash_instructions || "Wash instructions unavailable"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">Recent related orders</p>
              <div className="mt-3 space-y-2">
                {(selectedProduct.orders || []).slice(0, 5).map((order) => (
                  <div className="rounded-2xl border border-slate-100 px-4 py-3" key={order.order_number}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{order.order_number}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.buyer} · Qty {order.quantity}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-semibold text-slate-600">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {!selectedProduct && !selectedProductLoading ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            Select a product to load the protected detail route.
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function AssistantPlaceholder() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(16,34,39,0.06)]">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#f4efe8] px-3 py-1 text-sm font-semibold text-slate-700">
        <Bot aria-hidden="true" size={16} />
        Next backend milestone
      </div>
      <h2 className="mt-5 text-3xl font-semibold text-ink">AI assistant screen will connect next.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        Backend auth, dashboard, and products are now live. The next meaningful frontend integration is the
        natural-language assistant once the `/api/ai` route moves from status placeholder to real SQL generation.
      </p>
    </section>
  );
}

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const deferredFilters = useDeferredValue(filters);
  const [products, setProducts] = useState({ items: [], page: 1, page_size: 8, total: 0 });
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [selectedStyleNumber, setSelectedStyleNumber] = useState("WFX-2501");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductLoading, setSelectedProductLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState("");

  function loadDashboardSummary() {
    setSummaryLoading(true);
    setSummaryError("");
    getDashboardSummary()
      .then((data) => setSummary(data))
      .catch((error) => {
        const message = error.response?.data?.detail || "Unable to load dashboard summary.";
        setSummaryError(message);
        toast.error(message);
      })
      .finally(() => setSummaryLoading(false));
  }

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setSessionReady(true);
      return;
    }

    getMe()
      .then((nextUser) => setUser(nextUser))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setSessionReady(true));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    loadDashboardSummary();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProductsLoading(true);
    setProductsError("");
    getProducts({
      page,
      page_size: 8,
      ...deferredFilters,
    })
      .then((data) => {
        setProducts(data);
        if (!data.items?.length) {
          setSelectedProduct(null);
          return;
        }

        const selectedStillVisible = data.items.some(
          (item) => item.style_number === selectedStyleNumber,
        );

        if (!selectedStillVisible) {
          setSelectedStyleNumber(data.items[0].style_number);
        }
      })
      .catch((error) => {
        const message = error.response?.data?.detail || "Unable to load products.";
        setProductsError(message);
        toast.error(message);
      })
      .finally(() => setProductsLoading(false));
  }, [user, page, deferredFilters]);

  useEffect(() => {
    if (!user || !selectedStyleNumber) {
      return;
    }

    setSelectedProductLoading(true);
    setProductDetailError("");
    getProductDetail(selectedStyleNumber)
      .then((data) => setSelectedProduct(data))
      .catch((error) => {
        const message = error.response?.data?.detail || "Unable to load product detail.";
        setProductDetailError(message);
        toast.error(message);
      })
      .finally(() => setSelectedProductLoading(false));
  }, [user, selectedStyleNumber]);

  async function handleLogin(form) {
    setAuthLoading(true);
    try {
      const data = await login(form);
      persistSession(data.access_token, data.user);
      setUser(data.user);
      setSessionReady(true);
      toast.success("Signed in to protected ERP APIs.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setSummary(null);
    setProducts({ items: [], page: 1, page_size: 8, total: 0 });
    setSelectedProduct(null);
    setSelectedStyleNumber("WFX-2501");
    toast.success("Signed out.");
  }

  function handleFilterChange(key, value) {
    startTransition(() => {
      setPage(1);
      setFilters((current) => ({ ...current, [key]: value }));
    });
  }

  function handleProductSelect(styleNumber) {
    setSelectedStyleNumber(styleNumber);
  }

  if (!sessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4efe8] text-slate-600">
        Loading session...
      </main>
    );
  }

  if (!user) {
    return <LoginScreen loading={authLoading} onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe8_0%,#f8faf9_36%,#edf3f2_100%)] text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden h-screen w-72 shrink-0 border-r border-[#d8dfdd] bg-white/75 px-5 py-6 backdrop-blur lg:sticky lg:top-0 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
              <Sparkles aria-hidden="true" size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">WFX AI ERP</p>
              <p className="text-xs text-slate-500">Connected workspace</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;

              return (
                <button
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-[#102227] text-white shadow-sm"
                      : "text-slate-600 hover:bg-[#f7f9f8] hover:text-ink"
                  }`}
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  type="button"
                >
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[24px] border border-slate-200 bg-[#f8faf9] p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#d9773f]">
                <UserRound aria-hidden="true" size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="text-xs text-slate-500">
                  {user.role} · {user.email}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Auth state</p>
              <p className="mt-2 text-sm font-semibold text-ink">Bearer token active</p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#d8dfdd] bg-white/70 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#d9773f]">
                  Authenticated ERP surface
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-ink md:text-3xl">
                  Backend-backed dashboard and product intelligence
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-2xl bg-[#102227] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17333a]">
                  <Sparkles aria-hidden="true" size={17} />
                  {activeView === "assistant" ? "AI route pending" : "Protected API live"}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut aria-hidden="true" size={17} />
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
            {activeView === "dashboard" ? (
              <div className="space-y-4">
                {summaryError ? (
                  <div className="rounded-2xl border border-[#ef8f5a]/30 bg-[#fff4ed] px-4 py-4 text-sm text-[#b65a29]">
                    <div className="flex items-center justify-between gap-4">
                      <span>{summaryError}</span>
                      <button
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm"
                        onClick={loadDashboardSummary}
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : null}
                <DashboardView loading={summaryLoading} summary={summary} />
              </div>
            ) : null}

            {activeView === "products" ? (
              <ProductsView
                filters={filters}
                onFilterChange={handleFilterChange}
                onPageChange={setPage}
                onProductSelect={handleProductSelect}
                page={page}
                products={products}
                productsLoading={productsLoading}
                selectedProduct={selectedProduct}
                selectedProductLoading={selectedProductLoading}
                productDetailError={productDetailError}
                productsError={productsError}
              />
            ) : null}

            {activeView === "assistant" ? <AssistantPlaceholder /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
