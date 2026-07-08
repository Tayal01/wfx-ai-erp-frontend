import { motion } from "framer-motion";
import { ImageIcon, LoaderCircle, Search, Sparkles } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

import { searchProducts } from "../api.js";
import {
  EmptyState,
  ErrorBanner,
  SectionTitle,
  SkeletonBlock,
  SurfaceCard,
} from "../components/ui.jsx";

const defaultFilters = {
  category: "",
  color: "",
  fabric: "",
  season: "",
  supplier: "",
};

function SearchResultCard({ item, formatCurrency }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,34,39,0.04)]"
      initial={{ opacity: 0, y: 10 }}
    >
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f4efe8]">
          {item.image_url ? (
            <img alt={item.style_name} className="h-full w-full object-cover" src={item.image_url} />
          ) : (
            <ImageIcon aria-hidden="true" className="text-[#102227]" size={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">{item.style_name}</h3>
              <p className="text-sm text-slate-500">
                {item.style_number} · {item.category}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">Selling price</p>
              <p className="text-lg font-semibold text-[#d9773f]">
                {formatCurrency(item.selling_price)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>Color: {item.color}</p>
            <p>Fabric: {item.fabric}</p>
            <p>Supplier: {item.supplier}</p>
            <p>Season: {item.season}</p>
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

  useEffect(() => {
    const trimmedQuery = deferredQuery.trim();
    const activeFilters = Object.values(deferredFilters).some(Boolean);
    if (!trimmedQuery && !activeFilters) {
      setResults({ items: [], count: 0, engine: "" });
      setHasSearched(false);
      return;
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

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
          <Search aria-hidden="true" size={20} />
        </div>
        <SectionTitle
          subtitle="Search across style names, fabrics, colors, categories, suppliers, and tech-pack details."
          title="Intelligent product discovery"
        />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#4b8b69]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Try "Blue floral dress" or "Cotton polo t-shirt"'
            value={query}
          />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {Object.keys(defaultFilters).map((key) => (
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#4b8b69]"
              key={key}
              onChange={(event) => handleFilterChange(key, event.target.value)}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={filters[key]}
            />
          ))}
        </div>
      </SurfaceCard>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SurfaceCard className="p-5" key={index}>
              <SkeletonBlock className="h-24 w-full" />
            </SurfaceCard>
          ))}
        </div>
      ) : null}

      {!loading && hasSearched ? (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#102227]">
            <Sparkles aria-hidden="true" size={14} />
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
