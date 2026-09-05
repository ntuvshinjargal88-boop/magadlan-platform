"use client";

import { useState } from "react";
import type { ChapterTree, CriterionWithStatus } from "@/lib/compliance";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Эхлээгүй",
  IN_PROGRESS: "Хийгдэж буй",
  COMPLIANT: "Хангасан",
  NON_COMPLIANT: "Хангаагүй",
  NOT_APPLICABLE: "Хамаарахгүй",
};

const STATUS_COLOR: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLIANT: "bg-emerald-100 text-emerald-700",
  NON_COMPLIANT: "bg-red-100 text-red-700",
  NOT_APPLICABLE: "bg-slate-100 text-slate-400",
};

export default function CriteriaTree({ initialTree }: { initialTree: ChapterTree[] }) {
  const [tree, setTree] = useState(initialTree);
  const [openChapter, setOpenChapter] = useState<string | null>(initialTree[0]?.id ?? null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [openCriterion, setOpenCriterion] = useState<string | null>(null);

  function updateCriterionInState(criterionId: string, patch: Partial<CriterionWithStatus["status"]>) {
    setTree((prev) =>
      prev.map((ch) => ({
        ...ch,
        subChapters: ch.subChapters.map((sub) => ({
          ...sub,
          criteria: sub.criteria.map((c) =>
            c.id === criterionId ? { ...c, status: { ...c.status, ...patch } } : c
          ),
        })),
      }))
    );
  }

  return (
    <div className="space-y-3">
      {tree.map((ch) => (
        <div key={ch.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => setOpenChapter(openChapter === ch.id ? null : ch.id)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-semibold text-slate-900">
              Бүлэг {ch.code}. {ch.title}
            </span>
            <span className="text-slate-400">{openChapter === ch.id ? "−" : "+"}</span>
          </button>

          {openChapter === ch.id && (
            <div className="border-t border-slate-100 px-5 pb-4">
              {ch.subChapters.map((sub) => (
                <div key={sub.id} className="mt-3">
                  <button
                    onClick={() => setOpenSub(openSub === sub.id ? null : sub.id)}
                    className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-left text-sm font-medium text-slate-800"
                  >
                    <span>
                      Дэд бүлэг {sub.code}. {sub.title}
                    </span>
                    <span className="text-slate-400">{openSub === sub.id ? "−" : "+"}</span>
                  </button>

                  {openSub === sub.id && (
                    <ul className="mt-2 space-y-2">
                      {sub.criteria.map((crit) => (
                        <li key={crit.id} className="rounded-lg border border-slate-200">
                          <button
                            onClick={() =>
                              setOpenCriterion(openCriterion === crit.id ? null : crit.id)
                            }
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                          >
                            <span className="text-sm text-slate-800">
                              <span className="mr-2 font-medium text-slate-500">{crit.code}</span>
                              {crit.title}
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              {crit.linkedDocCount > 0 && (
                                <span className="badge bg-sky-50 text-sky-700">
                                  📎 {crit.linkedDocCount}
                                </span>
                              )}
                              <span className={`badge ${STATUS_COLOR[crit.status.status]}`}>
                                {STATUS_LABEL[crit.status.status]}
                              </span>
                            </span>
                          </button>

                          {openCriterion === crit.id && (
                            <CriterionEditor
                              criterion={crit}
                              onSaved={(patch) => updateCriterionInState(crit.id, patch)}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CriterionEditor({
  criterion,
  onSaved,
}: {
  criterion: CriterionWithStatus;
  onSaved: (patch: Partial<CriterionWithStatus["status"]>) => void;
}) {
  const [score, setScore] = useState<string>(
    criterion.status.score !== null ? String(criterion.status.score) : ""
  );
  const [status, setStatus] = useState(criterion.status.status);
  const [notes, setNotes] = useState(criterion.status.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const scoreOptions = criterion.scoreOptions.split(",").map((s) => s.trim());

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/criteria/${criterion.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: score === "" ? null : Number(score),
          status,
          notes,
        }),
      });
      if (res.ok) {
        onSaved({ score: score === "" ? null : Number(score), status, notes });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 text-sm">
      <p className="font-medium text-slate-500">Үйл ажиллагаанд тавигдах шаардлага</p>
      <p className="mt-1 text-slate-700">{criterion.requirement}</p>

      <p className="mt-3 font-medium text-slate-500">Хэмжих үзүүлэлт</p>
      <ul className="mt-1 list-inside list-decimal space-y-1 text-slate-700">
        {criterion.indicators.map((ind) => (
          <li key={ind.id}>{ind.text}</li>
        ))}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Үнэлгээ (оноо)</span>
          <select className="input" value={score} onChange={(e) => setScore(e.target.value)}>
            <option value="">—</option>
            {scoreOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Төлөв</span>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Тэмдэглэл</span>
        <textarea
          className="input"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Нотлох баримт, тайлбар..."
        />
      </label>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
        {saved && <span className="text-xs text-emerald-600">Хадгаллаа ✓</span>}
      </div>
    </div>
  );
}
