import { BarChart3, Bot, Image, PackageSearch } from "lucide-react";

const sections = [
  {
    title: "ERP Dashboard",
    description: "Operational KPIs, sales trends, invoices, and product movement.",
    icon: BarChart3,
  },
  {
    title: "AI Assistant",
    description: "Ask natural-language questions and convert them into dynamic SQL.",
    icon: Bot,
  },
  {
    title: "Product Discovery",
    description: "Search apparel products across fabrics, colors, categories, and suppliers.",
    icon: PackageSearch,
  },
  {
    title: "Image Search",
    description: "Upload garment images to find visually similar products.",
    icon: Image,
  },
];

function App() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-denim">
              WFX AI ERP Assistant
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">
              Apparel ERP, ready for AI workflows
            </h1>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            Frontend scaffold ready for API integration
          </div>
        </header>

        <section className="grid flex-1 gap-4 py-8 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                key={section.title}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-denim text-white">
                    <Icon aria-hidden="true" size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {section.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default App;
