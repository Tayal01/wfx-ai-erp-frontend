import { motion } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, LoaderCircle, SendHorizontal, Sparkles } from "lucide-react";
import { useState } from "react";

import { askAssistant } from "../api.js";
import { EmptyState, ErrorBanner, SectionTitle, SurfaceCard } from "../components/ui.jsx";

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

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8 }}
    >
      <div
        className={`max-w-3xl rounded-[24px] px-5 py-4 text-sm leading-7 shadow-sm ${
          isUser
            ? "bg-[#102227] text-white"
            : "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

export default function AssistantView({ getApiErrorMessage, notifyError }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [showSql, setShowSql] = useState(false);
  const [showRows, setShowRows] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setInput("");
    setMessages((current) => [
      ...current,
      { role: "user", content: question },
    ]);

    try {
      const result = await askAssistant(question);
      setLatestResult(result);
      setShowSql(false);
      setShowRows(false);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.summary },
      ]);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to answer that ERP question.");
      setError(message);
      notifyError("assistant-chat", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
          <Bot aria-hidden="true" size={20} />
        </div>
        <SectionTitle
          subtitle="Ask anything about buyers, suppliers, products, orders, and invoices."
          title="Natural-language ERP assistant"
        />
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          The assistant generates SQL from your question, runs a read-only query against Supabase,
          and returns a business summary with optional SQL and result previews.
        </p>
      </SurfaceCard>

      <SurfaceCard className="p-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <EmptyState message="Try a question like “Which buyer generated the highest revenue?” or “Show pending invoices above 71000.”" />
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} message={message} />
            ))
          )}

          {loading ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
              Generating SQL and summarizing ERP results...
            </div>
          ) : null}
        </div>

        <ErrorBanner message={error} />

        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
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

      {latestResult ? (
        <SurfaceCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#102227]">
                <Sparkles aria-hidden="true" size={14} />
                Query insight
              </div>
              <SectionTitle
                subtitle={`${latestResult.row_count} rows returned`}
                title="Generated SQL and results"
              />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <button
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-left text-sm font-semibold text-ink"
              onClick={() => setShowSql((current) => !current)}
              type="button"
            >
              Generated SQL
              {showSql ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showSql ? (
              <pre className="overflow-x-auto rounded-2xl bg-[#102227] p-4 text-xs leading-6 text-[#d7ece2]">
                {latestResult.sql}
              </pre>
            ) : null}

            <button
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-left text-sm font-semibold text-ink"
              onClick={() => setShowRows((current) => !current)}
              type="button"
            >
              Result preview
              {showRows ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showRows ? <ResultsTable rows={latestResult.rows} /> : null}
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
