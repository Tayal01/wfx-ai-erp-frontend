import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Building2,
  ImageIcon,
  Layers3,
  LoaderCircle,
  Palette,
  RotateCcw,
  Ruler,
  Search,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { searchProducts } from "../api.js";
import {
  EmptyState,
  ErrorBanner,
  SkeletonBlock,
  SurfaceCard,
} from "../components/ui.jsx";

const defaultFilters = {
  category: "",
  color: "",
  fabric: "",
  season: "",
  supplier: "",
  print: "",
  buyer: "",
  gsm_min: "",
  gsm_max: "",
};

const filterFields = [
  { key: "category", label: "Category", placeholder: "Dress, Hoodie...", icon: Layers3 },
  { key: "color", label: "Color", placeholder: "Blue, Black...", icon: Palette },
  { key: "fabric", label: "Fabric", placeholder: "Cotton, Denim...", icon: Tag },
  { key: "season", label: "Season", placeholder: "AW26, SS25...", icon: Sparkles },
  { key: "supplier", label: "Supplier", placeholder: "Supplier name", icon: Building2 },
  { key: "print", label: "Print", placeholder: "Solid, Striped...", icon: ArrowUpDown },
  { key: "buyer", label: "Buyer", placeholder: "Buyer company", icon: Users },
  { key: "gsm_min", label: "GSM min", placeholder: "180", icon: Ruler },
  { key: "gsm_max", label: "GSM max", placeholder: "320", icon: Ruler },
];

function getMatchPercent(item) {
  const value = item.match_percent ?? item.similarity_percent;
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function MatchBadge({ item }) {
  const matchPercent = getMatchPercent(item);

  if (matchPercent === null) {
    return null;
  }

  return (
    <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[#d7e8df] bg-[#f7fbf8] px-3 py-1.5 text-xs shadow-[0_6px_16px_rgba(16,34,39,0.04)]">
      <span className="font-semibold text-[#2f6f4e]">{matchPercent}% match</span>
      <span className="h-1 w-14 overflow-hidden rounded-full bg-[#dfeee6]" aria-hidden="true">
        <span className="block h-full rounded-full bg-[#4b8b69]" style={{ width: `${matchPercent}%` }} />
      </span>
      <span className="hidden text-slate-500 sm:inline">
        {item.match_basis === "visual similarity" ? "Visual" : "Relevant"}
      </span>
    </div>
  );
}

function PriceSummary({ item, formatCurrency }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-[0_6px_16px_rgba(16,34,39,0.03)] sm:min-w-[128px] lg:text-right">
      <p className="text-xs uppercase tracking-wide text-slate-500">Selling price</p>
      <p className="text-lg font-semibold text-[#d9773f]">{formatCurrency(item.selling_price)}</p>
    </div>
  );
}

function ProductAttribute({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f8faf9] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function SearchResultImage({ item }) {
  return (
    <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-[#f4efe8] md:aspect-auto md:min-h-44">
      {item.image_url ? (
        <img alt={item.style_name} className="h-full w-full object-cover" loading="lazy" src={item.image_url} />
      ) : (
        <ImageIcon aria-hidden="true" className="text-[#102227]" size={28} />
      )}
      <div className="absolute left-3 top-3 md:hidden">
        <MatchBadge item={item} />
      </div>
    </div>
  );
}

function SearchResultCard({ item, formatCurrency }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(16,34,39,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300"
      initial={false}
    >
      <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
        <SearchResultImage item={item} />
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-ink">{item.style_name}</h3>
                <div className="hidden md:block">
                  <MatchBadge item={item} />
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {item.style_number} · {item.category}
              </p>
            </div>
            <div className="sm:w-fit">
              <PriceSummary formatCurrency={formatCurrency} item={item} />
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <ProductAttribute label="Color" value={item.color} />
            <ProductAttribute label="Fabric" value={item.fabric} />
            <ProductAttribute label="GSM" value={item.gsm} />
            <ProductAttribute label="Print" value={item.print} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProductSearchView({
  formatCurrency,
  getApiErrorMessage,
  notifyError,
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const deferredQuery = useDeferredValue(query);
  const deferredFilters = useDeferredValue(filters);
  const [results, setResults] = useState({ items: [], count: 0, engine: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  useEffect(() => {
    const trimmedQuery = deferredQuery.trim();
    const activeFilters = Object.values(deferredFilters).some(Boolean);
    if (!trimmedQuery && !activeFilters) {
      setResults({ items: [], count: 0, engine: "" });
      setHasSearched(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      setHasSearched(true);

      try {
        const data = await searchProducts({
          query: trimmedQuery,
          ...deferredFilters,
        });
        setResults(data);
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, "Unable to search products.");
        setError(message);
        notifyError("product-search", message);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [deferredQuery, deferredFilters, getApiErrorMessage, notifyError]);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleResetFilters() {
    setFilters(defaultFilters);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <SurfaceCard className="overflow-hidden p-0">
        <div className="bg-[linear-gradient(135deg,#102227_0%,#16333b_52%,#214751_100%)] px-4 py-5 text-white sm:px-5 sm:py-6 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                <Sparkles aria-hidden="true" size={14} />
                Typesense powered
              </div>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Product Search</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-200">
                Search style names, fabrics, colors, suppliers, buyers, GSM, and print attributes.
              </p>
            </div>
            <div className="w-fit rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">
              {activeFilterCount} active filters
            </div>
          </div>

          <div className="relative mt-5">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full rounded-[20px] border border-white/10 bg-white/95 py-4 pl-12 pr-4 text-sm text-ink outline-none transition focus:border-[#4b8b69] focus:ring-2 focus:ring-[#4b8b69]/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Try "Blue floral dress" or "Cotton polo t-shirt"'
              value={query}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-[#fbfcfb] px-4 py-5 sm:px-5 md:px-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600">Refine results with apparel-specific filters.</p>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={handleResetFilters}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={15} />
              Reset filters
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filterFields.map((field) => {
              const Icon = field.icon;
              return (
                <label
                  className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(16,34,39,0.03)] transition focus-within:border-[#4b8b69] focus-within:ring-2 focus-within:ring-[#4b8b69]/10"
                  key={field.key}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Icon aria-hidden="true" size={14} />
                    {field.label}
                  </span>
                  <input
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-slate-400"
                    onChange={(event) => handleFilterChange(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    value={filters[field.key]}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </SurfaceCard>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SurfaceCard className="p-5" key={index}>
              <SkeletonBlock className="h-32 w-full" />
            </SurfaceCard>
          ))}
        </div>
      ) : null}

      {!loading && hasSearched ? (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#102227]">
            {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={14} /> : null}
            {results.count} matches {results.engine ? `via ${results.engine}` : ""}
          </div>
          {results.items?.length ? (
            <div className="grid gap-4">
              {results.items.map((item) => (
                <SearchResultCard formatCurrency={formatCurrency} item={item} key={item.style_number} />
              ))}
            </div>
          ) : (
            <EmptyState message="No products matched this search. Try broader keywords or remove filters." />
          )}
        </div>
      ) : null}

      {!loading && !hasSearched ? (
        <EmptyState message="Start typing to search the indexed product catalog." />
      ) : null}
    </div>
  );
}
