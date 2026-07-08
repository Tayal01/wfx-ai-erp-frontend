import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { BarChart3, Bot, LogOut, PackageSearch, ShieldCheck, Sparkles, UserRound } from "lucide-react";
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
import { ErrorBanner } from "./components/ui.jsx";
import AssistantPlaceholder from "./views/AssistantPlaceholder.jsx";
import DashboardView from "./views/DashboardView.jsx";
import LoginScreen from "./views/LoginScreen.jsx";
import ProductsView from "./views/ProductsView.jsx";

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

const DASHBOARD_CACHE_KEY = "wfx-dashboard-summary";
const DASHBOARD_CACHE_TTL_MS = 60 * 1000;

function getApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;
  const message = typeof detail === "string" ? detail : error?.message;

  if (!message) {
    return fallbackMessage;
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("network error") ||
    normalized.includes("resource temporarily unavailable") ||
    normalized.includes("failed to fetch")
  ) {
    return "Backend connection is unavailable right now. Check the API server and try again.";
  }

  if (normalized.includes("401") || normalized.includes("unauthorized")) {
    return "Your session expired. Please sign in again.";
  }

  return message;
}

function notifyError(key, message) {
  toast.error(message, { id: `error:${key}` });
}

function notifySuccess(key, message) {
  toast.success(message, { id: `success:${key}` });
}

function getCachedDashboardSummary() {
  const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !parsed?.data) {
      return null;
    }

    if (Date.now() - parsed.timestamp > DASHBOARD_CACHE_TTL_MS) {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
    return null;
  }
}

function setCachedDashboardSummary(summary) {
  sessionStorage.setItem(
    DASHBOARD_CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: summary,
    }),
  );
}

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

function AppSidebar({ activeView, onNavigate, user }) {
  return (
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
              onClick={() => onNavigate(item.id)}
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
          <p className="text-xs uppercase tracking-wide text-slate-500">Workspace access</p>
          <p className="mt-2 text-sm font-semibold text-ink">Authenticated session</p>
        </div>
      </div>
    </aside>
  );
}

function AppHeader({ activeView, onLogout }) {
  const titleMap = {
    dashboard: {
      eyebrow: "Operations overview",
      title: "Dashboard",
    },
    products: {
      eyebrow: "Catalog workspace",
      title: "Products",
    },
    assistant: {
      eyebrow: "Natural language layer",
      title: "AI Assistant",
    },
  };

  const current = titleMap[activeView];

  return (
    <header className="border-b border-[#d8dfdd] bg-white/70 px-5 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#d9773f]">{current.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink md:text-3xl">{current.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <ShieldCheck aria-hidden="true" size={16} className="text-[#4b8b69]" />
            Secure session
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            onClick={onLogout}
            type="button"
          >
            <LogOut aria-hidden="true" size={17} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());

  const cachedSummary = getCachedDashboardSummary();
  const [summary, setSummary] = useState(cachedSummary);
  const [summaryLoading, setSummaryLoading] = useState(() => !cachedSummary);
  const [summaryError, setSummaryError] = useState("");

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const deferredFilters = useDeferredValue(filters);
  const [products, setProducts] = useState({ items: [], page: 1, page_size: 8, total: 0 });
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [selectedStyleNumber, setSelectedStyleNumber] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductLoading, setSelectedProductLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState("");
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  const dashboardRequestRef = useRef(0);
  const productsRequestRef = useRef(0);
  const productDetailRequestRef = useRef(0);

  function loadDashboardSummary() {
    const requestId = dashboardRequestRef.current + 1;
    dashboardRequestRef.current = requestId;
    setSummaryLoading(true);
    setSummaryError("");
    getDashboardSummary()
      .then((data) => {
        if (dashboardRequestRef.current !== requestId) {
          return;
        }

        setSummary(data);
        setCachedDashboardSummary(data);
        setSummaryError("");
      })
      .catch((error) => {
        if (dashboardRequestRef.current !== requestId) {
          return;
        }

        const message = getApiErrorMessage(error, "Unable to load dashboard summary.");
        setSummaryError(message);
        notifyError("dashboard-summary", message);
      })
      .finally(() => {
        if (dashboardRequestRef.current !== requestId) {
          return;
        }

        setSummaryLoading(false);
      });
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

    const requestId = productsRequestRef.current + 1;
    productsRequestRef.current = requestId;
    setProductsLoading(true);
    setProductsError("");
    getProducts({
      page,
      page_size: 8,
      ...deferredFilters,
    })
      .then((data) => {
        if (productsRequestRef.current !== requestId) {
          return;
        }

        setProducts(data);
        setProductsError("");
        if (!data.items?.length) {
          setSelectedProduct(null);
          setSelectedStyleNumber("");
          return;
        }

        const selectedStillVisible = data.items.some(
          (item) => item.style_number === selectedStyleNumber,
        );

        if (!selectedStillVisible && isProductDetailOpen) {
          setSelectedStyleNumber(data.items[0].style_number);
        }
      })
      .catch((error) => {
        if (productsRequestRef.current !== requestId) {
          return;
        }

        const message = getApiErrorMessage(error, "Unable to load products.");
        setProductsError(message);
        setSelectedProduct(null);
        notifyError("products-list", message);
      })
      .finally(() => {
        if (productsRequestRef.current !== requestId) {
          return;
        }

        setProductsLoading(false);
      });
  }, [user, page, deferredFilters]);

  useEffect(() => {
    if (!user || !selectedStyleNumber || !isProductDetailOpen) {
      return;
    }

    const requestId = productDetailRequestRef.current + 1;
    productDetailRequestRef.current = requestId;
    setSelectedProductLoading(true);
    setProductDetailError("");
    getProductDetail(selectedStyleNumber)
      .then((data) => {
        if (productDetailRequestRef.current !== requestId) {
          return;
        }

        setSelectedProduct(data);
        setProductDetailError("");
      })
      .catch((error) => {
        if (productDetailRequestRef.current !== requestId) {
          return;
        }

        const message = getApiErrorMessage(error, "Unable to load product detail.");
        setProductDetailError(message);
        notifyError("product-detail", message);
      })
      .finally(() => {
        if (productDetailRequestRef.current !== requestId) {
          return;
        }

        setSelectedProductLoading(false);
      });
  }, [user, selectedStyleNumber, isProductDetailOpen]);

  async function handleLogin(form) {
    setAuthLoading(true);
    try {
      const data = await login(form);
      persistSession(data.access_token, data.user);
      setUser(data.user);
      setSessionReady(true);
      notifySuccess("login", "Signed in. Protected ERP APIs are ready.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    dashboardRequestRef.current += 1;
    productsRequestRef.current += 1;
    productDetailRequestRef.current += 1;
    clearSession();
    sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
    setUser(null);
    setSummary(null);
    setSummaryError("");
    setProducts({ items: [], page: 1, page_size: 8, total: 0 });
    setProductsError("");
    setSelectedProduct(null);
    setSelectedStyleNumber("");
    setProductDetailError("");
    setIsProductDetailOpen(false);
    notifySuccess("logout", "Signed out successfully.");
  }

  function handleFilterChange(key, value) {
    startTransition(() => {
      setPage(1);
      setFilters((current) => ({ ...current, [key]: value }));
    });
  }

  function handleProductSelect(styleNumber) {
    setSelectedStyleNumber(styleNumber);
    setSelectedProduct(null);
    setIsProductDetailOpen(true);
  }

  function handleProductModalClose() {
    setIsProductDetailOpen(false);
    setProductDetailError("");
  }

  function handleResetFilters() {
    startTransition(() => {
      setPage(1);
      setFilters(defaultFilters);
    });
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
        <AppSidebar activeView={activeView} onNavigate={setActiveView} user={user} />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppHeader activeView={activeView} onLogout={handleLogout} />

          <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
            {activeView === "dashboard" ? (
              <div className="space-y-4">
                <ErrorBanner
                  action={
                    <button
                      className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm"
                      onClick={loadDashboardSummary}
                      type="button"
                    >
                      Retry
                    </button>
                  }
                  message={summaryError}
                />
                <DashboardView
                  formatCompactNumber={formatCompactNumber}
                  formatCurrency={formatCurrency}
                  loading={summaryLoading}
                  summary={summary}
                />
              </div>
            ) : null}

            {activeView === "products" ? (
              <ProductsView
                filters={filters}
                formatCompactNumber={formatCompactNumber}
                formatCurrency={formatCurrency}
                isDetailOpen={isProductDetailOpen}
                onFilterChange={handleFilterChange}
                onPageChange={setPage}
                onProductModalClose={handleProductModalClose}
                onProductSelect={handleProductSelect}
                onResetFilters={handleResetFilters}
                page={page}
                productDetailError={productDetailError}
                products={products}
                productsError={productsError}
                productsLoading={productsLoading}
                selectedProduct={selectedProduct}
                selectedProductLoading={selectedProductLoading}
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
