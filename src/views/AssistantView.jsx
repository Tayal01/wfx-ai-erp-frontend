import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Database,
  LoaderCircle,
  Rows3,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { askAssistant } from "../api.js";
import { EmptyState, ErrorBanner, SectionTitle, SurfaceCard } from "../components/ui.jsx";

const AGENT_STEPS = [
  "Understanding your question...",
  "Generating SQL...",
  "Running query...",
  "Summarizing results...",
];
const RESULT_PREVIEW_LIMIT = 8;

function ResultsTable({ rows }) {
  if (!rows?.length) {
    return <EmptyState className="py-6" message="The query ran successfully but returned no rows." />;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-[#f8faf9]">
          <tr>
            {columns.map((column) => (
              <th className="px-4 py-3 font-semibold text-slate-600" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.slice(0, RESULT_PREVIEW_LIMIT).map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td className="px-4 py-3 text-slate-700" key={column}>
                  {String(row[column] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollapsibleRunSection({ children, defaultOpen = false, icon: Icon, title, value }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink">
          <Icon aria-hidden="true" className="shrink-0" size={14} />
          <span className="truncate">{title}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
          {value}
          {open ? <ChevronUp aria-hidden="true" size={15} /> : <ChevronDown aria-hidden="true" size={15} />}
        </span>
      </button>
      {open ? <div className="border-t border-slate-200 p-4 pt-3">{children}</div> : null}
    </div>
  );
}

function UserBubble({ content }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="flex justify-end" initial={{ opacity: 0, y: 8 }}>
      <div className="max-w-3xl rounded-[24px] bg-[#102227] px-5 py-4 text-sm leading-7 text-white shadow-sm">
        {content}
      </div>
    </motion.div>
  );
}

function StatusBubble({ step }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="flex justify-start" initial={{ opacity: 0, y: 8 }}>
      <div className="max-w-3xl rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        <div className="inline-flex items-center gap-2 font-medium text-ink">
          <LoaderCircle aria-hidden="true" className="animate-spin text-[#4b8b69]" size={16} />
          <span>{step}</span>
        </div>
        <AgentRunSteps activeStep={AGENT_STEPS.indexOf(step)} className="mt-4" />
      </div>
    </motion.div>
  );
}

function AgentRunSteps({ activeStep = null, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {AGENT_STEPS.map((label, index) => {
        const completed = activeStep === null;
        const isDone = completed || index < activeStep;
        const isActive = !completed && index === activeStep;
        return (
          <div className="flex items-center gap-2 text-xs text-slate-500" key={label}>
            {isDone ? (
              <CheckCircle2 aria-hidden="true" className="text-[#4b8b69]" size={14} />
            ) : isActive ? (
              <LoaderCircle aria-hidden="true" className="animate-spin text-[#4b8b69]" size={14} />
            ) : (
              <Circle aria-hidden="true" className="text-slate-300" size={14} />
            )}
            <span className={isActive ? "font-semibold text-ink" : ""}>{label.replace("...", "")}</span>
          </div>
        );
      })}
    </div>
  );
}

function AssistantResultBubble({ message }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="flex justify-start" initial={{ opacity: 0, y: 8 }}>
      <div className="max-w-3xl rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-700 shadow-sm">
        <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink">
            <Sparkles aria-hidden="true" size={13} />
            Agent run
          </p>
          <AgentRunSteps className="mt-3" />
        </div>

        <div className="mt-4 space-y-3">
          <CollapsibleRunSection icon={Database} title="Generated SQL" value="View query">
            <pre className="overflow-x-auto rounded-2xl bg-[#102227] p-4 text-xs leading-6 text-[#d7ece2]">
              {message.sql}
            </pre>
          </CollapsibleRunSection>

          <CollapsibleRunSection
            icon={Rows3}
            title="Result preview"
            value={`${Math.min(message.rows?.length || 0, RESULT_PREVIEW_LIMIT)} of ${message.row_count} rows`}
          >
            <ResultsTable rows={message.rows} />
          </CollapsibleRunSection>
        </div>

        <div className="mt-4 rounded-2xl bg-[#f4efe8] px-4 py-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#102227]">
            <Sparkles aria-hidden="true" size={12} />
            ERP insight
          </div>
          <p>{message.summary}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AssistantView({ getApiErrorMessage, notifyError }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeStep, loading]);

  useEffect(() => {
    if (!loading) {
      return undefined;
    }

    setActiveStep(0);
    const intervalId = window.setInterval(() => {
      setActiveStep((current) => (current < AGENT_STEPS.length - 1 ? current + 1 : current));
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [loading]);

  async function handleSubmit(event) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setInput("");
    setMessages((current) => [...current, { type: "user", content: question }]);

    try {
      const result = await askAssistant(question);
      setMessages((current) => [
        ...current.filter((message) => message.type !== "status"),
        {
          type: "assistant",
          summary: result.summary,
          sql: result.sql,
          rows: result.rows,
          row_count: result.row_count,
        },
      ]);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to answer that ERP question.");
      setError(message);
      setMessages((current) => current.filter((item) => item.type !== "status"));
      notifyError("assistant-chat", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#102227] text-white">
            <Bot aria-hidden="true" size={19} />
          </div>
          <SectionTitle
            subtitle="Ask about buyers, suppliers, products, orders, and invoices."
            title="Natural-language ERP assistant"
          />
        </div>
      </SurfaceCard>

      <SurfaceCard className="flex min-h-[420px] flex-col p-5 md:p-6">
        <div className="max-h-[56vh] min-h-[260px] flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && !loading ? (
            <EmptyState
              className="py-8"
              message='Try "Which buyer generated the highest revenue?" or "Show pending invoices above 71000."'
            />
          ) : null}

          {messages.map((message, index) => {
            if (message.type === "user") {
              return <UserBubble content={message.content} key={`user-${index}`} />;
            }
            if (message.type === "assistant") {
              return <AssistantResultBubble key={`assistant-${index}`} message={message} />;
            }
            return null;
          })}

          {loading ? <StatusBubble step={AGENT_STEPS[activeStep]} /> : null}
          <div ref={chatEndRef} />
        </div>

        <ErrorBanner message={error} />

        <form className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="assistant-question">
            Ask an ERP question
          </label>
          <input
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#4b8b69]"
            id="assistant-question"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about products, buyers, suppliers, orders, or invoices..."
            value={input}
          />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102227] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12323a] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !input.trim()}
            type="submit"
          >
            <SendHorizontal aria-hidden="true" size={16} />
            Ask
          </button>
        </form>
      </SurfaceCard>
    </div>
  );
}
