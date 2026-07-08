import { motion } from "framer-motion";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Database,
  LoaderCircle,
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

function ResultsTable({ rows }) {
  if (!rows?.length) {
    return <EmptyState message="The query ran successfully but returned no rows." />;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
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
          {rows.slice(0, 20).map((row, index) => (
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
      <div className="inline-flex items-center gap-2 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        <LoaderCircle aria-hidden="true" className="animate-spin text-[#4b8b69]" size={16} />
        <span>{step}</span>
      </div>
    </motion.div>
  );
}

function AssistantResultBubble({ message }) {
  const [showSql, setShowSql] = useState(false);
  const [showRows, setShowRows] = useState(false);

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="flex justify-start" initial={{ opacity: 0, y: 8 }}>
      <div className="max-w-3xl rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-700 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f4efe8] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#102227]">
          <Sparkles aria-hidden="true" size={12} />
          ERP insight
        </div>
        <p>{message.summary}</p>

        <div className="mt-4 space-y-3">
          <button
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink"
            onClick={() => setShowSql((current) => !current)}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <Database aria-hidden="true" size={14} />
              Generated SQL
            </span>
            {showSql ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showSql ? (
            <pre className="overflow-x-auto rounded-2xl bg-[#102227] p-4 text-xs leading-6 text-[#d7ece2]">
              {message.sql}
            </pre>
          ) : null}

          <button
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink"
            onClick={() => setShowRows((current) => !current)}
            type="button"
          >
            Result preview ({message.row_count} rows)
            {showRows ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showRows ? <ResultsTable rows={message.rows} /> : null}
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
    <div className="space-y-6">
      <SurfaceCard className="p-5 md:p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
          <Bot aria-hidden="true" size={20} />
        </div>
        <SectionTitle
          subtitle="Ask anything about buyers, suppliers, products, orders, and invoices."
          title="Natural-language ERP assistant"
        />
      </SurfaceCard>

      <SurfaceCard className="flex min-h-[520px] flex-col p-5 md:p-6">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && !loading ? (
            <EmptyState message='Try "Which buyer generated the highest revenue?" or "Show pending invoices above 71000."' />
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

        <form className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row" onSubmit={handleSubmit}>
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
