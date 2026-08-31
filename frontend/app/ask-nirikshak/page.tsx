"use client";

import React, { useState } from "react";
import { askNirikshakAssistant } from "@/lib/api";
import { chatbotQuerySchema, type ChatbotQueryFormValues } from "@/schemas/assistant";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { Bot, Send, Sparkles, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AskNirikshak() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const promptChips = [
    "Which projects should I inspect first?",
    "Why is P1045 high risk?",
    "Show projects with high expenditure but low physical progress",
    "Which agency has the highest number of risk flags?",
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ChatbotQueryFormValues>({
    resolver: zodResolver(chatbotQuerySchema),
    defaultValues: { query: "" },
  });

  const onSubmit = async (data: ChatbotQueryFormValues) => {
    setLoading(true);
    try {
      const res = await askNirikshakAssistant(data.query);
      setResponse(res);
    } catch (err) {
      console.error("Error querying assistant:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    setValue("query", chipText);
    onSubmit({ query: chipText });
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-slate-800" />
          Ask NIRIKSHAK — Natural Language Query Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Query project metrics, financial anomalies, and risk queue priorities using natural language
        </p>
      </div>

      {/* Query Search Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Ask a question (e.g. 'Which projects should I inspect first?')..."
                {...register("query")}
                className="py-3 pr-10"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading}
                className="absolute right-1.5 top-1.5 h-7 w-7"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          {errors.query && (
            <p className="text-[11px] text-red-600 font-semibold">{errors.query.message}</p>
          )}
        </form>

        {/* Prompt Chips */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {promptChips.map((chip, idx) => (
              <Button
                key={idx}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleChipClick(chip)}
                className="text-[11px] font-semibold text-left h-auto py-1 px-3"
              >
                &quot;{chip}&quot;
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Assistant Response Box */}
      {loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {response && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 uppercase">
              NIRIKSHAK Assistant Response
            </span>
          </div>

          <p className="text-xs text-slate-800 font-medium leading-relaxed">
            {response.answer_text}
          </p>

          {/* Table Result Display */}
          {response.query_type === "table" && response.table_data && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                    {response.table_columns.map((col: string) => (
                      <th key={col} className="py-2.5 px-3">
                        {col.replace("_", " ")}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {response.table_data.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      {response.table_columns.map((col: string) => (
                        <td
                          key={col}
                          className="py-2.5 px-3 font-semibold text-slate-900"
                        >
                          {row[col]}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right">
                        {row.project_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/projects/${row.project_id}`)
                            }
                            className="font-bold text-[11px]"
                          >
                            Inspect <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Key Value Details Display */}
          {response.query_type === "key_value" && response.details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {response.details.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded border border-slate-200"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {item.label}
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Suggested Followups */}
          {response.suggested_followups && (
            <div className="pt-3 border-t border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Follow-up Queries:
              </span>
              <div className="flex flex-wrap gap-2">
                {response.suggested_followups.map((f: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleChipClick(f)}
                    className="text-slate-600 hover:text-slate-900 text-[11px] font-semibold underline cursor-pointer"
                  >
                    • {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
