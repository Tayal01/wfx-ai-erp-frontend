import { motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  PackageSearch,
  Tag,
  Truck,
} from "lucide-react";

import { CompactStat, MetricCard, SectionTitle, SurfaceCard } from "../components/ui.jsx";

export default function DashboardView({
  summary,
  loading,
  formatCompactNumber,
  formatCurrency,
}) {
  const kpis = summary?.kpis;
  const charts = summary?.charts;
  const recent = summary?.recent;

  const cards = [
    {
      label: "Sales orders",
      value: kpis ? formatCompactNumber(kpis.sales_orders) : "...",
      detail: "Open order base",
      icon: ClipboardList,
      tone: "bg-[#12323a]",
    },
    {
      label: "Finished goods",
      value: kpis ? formatCompactNumber(kpis.finished_goods) : "...",
      detail: "Catalog coverage",
      icon: Boxes,
      tone: "bg-[#4b8b69]",
    },
    {
      label: "Invoice amount",
      value: kpis ? formatCurrency(kpis.invoice_amount) : "...",
      detail: "Collected and pending",
      icon: FileSpreadsheet,
      tone: "bg-[#d9773f]",
    },
    {
      label: "Pending invoices",
      value: kpis ? formatCurrency(kpis.pending_invoice_amount) : "...",
      detail: "Requires follow-up",
      icon: CheckCircle2,
      tone: "bg-[#b44e46]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
        <SurfaceCard className="p-5">
          <SectionTitle
            subtitle="Live merchandising overview"
            title="Overview"
          />
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Orders, catalog health, and invoicing signals for the current workspace.
          </p>
        </SurfaceCard>
        <CompactStat icon={PackageSearch} label="Buyers" value={kpis ? formatCompactNumber(kpis.buyers) : "..."} />
        <CompactStat icon={Truck} label="Suppliers" value={kpis ? formatCompactNumber(kpis.suppliers) : "..."} />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            key={card.label}
            transition={{ delay: index * 0.05, duration: 0.25 }}
          >
            <MetricCard {...card} value={loading ? "..." : card.value} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SurfaceCard className="p-5">
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
                      style={{ width: `${Math.max(18, 100 - index * 12)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5">
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
        </SurfaceCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard className="p-5">
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
        </SurfaceCard>

        <SurfaceCard className="p-5">
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
        </SurfaceCard>
      </section>
    </div>
  );
}
