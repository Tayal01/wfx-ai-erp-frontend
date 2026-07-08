import { Bot } from "lucide-react";

import { SectionTitle, SurfaceCard } from "../components/ui.jsx";

export default function AssistantPlaceholder() {
  return (
    <SurfaceCard className="p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
        <Bot aria-hidden="true" size={20} />
      </div>
      <SectionTitle
        subtitle="Natural-language workflows come next."
        title="AI assistant"
      />
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        This view will connect to the NL-to-SQL workflow once the assistant route is promoted from placeholder to production behavior.
      </p>
    </SurfaceCard>
  );
}
