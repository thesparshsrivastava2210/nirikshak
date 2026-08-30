import React, { useState } from 'react';
import { askNirishakAssistant } from '../services/api';
import { Bot, Send, Sparkles, ChevronRight, CornerDownLeft, Table as TableIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AskNirishak() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const promptChips = [
    "Which projects should I inspect first?",
    "Why is P1045 high risk?",
    "Show projects with high expenditure but low physical progress",
    "Which agency has the highest number of risk flags?"
  ];

  const handleSearch = async (queryText) => {
    const qToUse = queryText || query;
    if (!qToUse.trim()) return;
    setLoading(true);
    setQuery(qToUse);

    try {
      const res = await askNirishakAssistant(qToUse);
      setResponse(res);
    } catch (err) {
      console.error('Error querying assistant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-slate-800" />
          Ask NIRISHAK — Natural Language Query Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Query project metrics, financial anomalies, and risk queue priorities using natural language
        </p>
      </div>

      {/* Query Search Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask a question (e.g. 'Which projects should I inspect first?')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium placeholder-slate-400 pr-10"
            />
            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-slate-900 text-white rounded hover:bg-slate-800">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Prompt Chips */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Queries:</span>
          <div className="flex flex-wrap gap-2">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(chip)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-3 py-1 rounded border border-slate-200 transition text-left"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assistant Response Box */}
      {loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-xs font-medium animate-pulse">
          Querying NIRISHAK Risk Database...
        </div>
      )}

      {response && !loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 uppercase">NIRISHAK Assistant Response</span>
          </div>

          <p className="text-xs text-slate-800 font-medium leading-relaxed">{response.answer_text}</p>

          {/* Table Result Display */}
          {response.query_type === 'table' && response.table_data && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                    {response.table_columns.map(col => (
                      <th key={col} className="py-2.5 px-3">{col.replace('_', ' ')}</th>
                    ))}
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {response.table_data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      {response.table_columns.map(col => (
                        <td key={col} className="py-2.5 px-3 font-semibold text-slate-900">
                          {row[col]}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right">
                        {row.project_id && (
                          <button
                            onClick={() => navigate(`/projects/${row.project_id}`)}
                            className="text-slate-900 hover:underline font-bold text-[11px] inline-flex items-center gap-0.5"
                          >
                            Inspect <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Key Value Details Display */}
          {response.query_type === 'key_value' && response.details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {response.details.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                  <p className="font-bold text-slate-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Suggested Followups */}
          {response.suggested_followups && (
            <div className="pt-3 border-t border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Follow-up Queries:</span>
              <div className="flex flex-wrap gap-2">
                {response.suggested_followups.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(f)}
                    className="text-slate-600 hover:text-slate-900 text-[11px] font-semibold underline"
                  >
                    • {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
