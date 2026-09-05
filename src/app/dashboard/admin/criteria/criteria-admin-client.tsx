"use client";

import { useEffect, useState } from "react";

type ChapterSummary = { id: string; code: string; title: string; subChapterCount: number; criteriaCount: number };

const EXAMPLE = `{
  "code": "3",
  "title": "БҮЛЭГ 3-ЫН НЭР",
  "sourceOrder": "ЭМ-ийн сайдын 2019.12.06-ны өдрийн А/554 дугаар тушаалын хавсралт",
  "subChapters": [
    {
      "code": "1",
      "title": "ДЭД БҮЛЭГ 1-ИЙН НЭР",
      "criteria": [
        {
          "code": "1.1",
          "requirement": "Үйл ажиллагаанд тавигдах шаардлага...",
          "title": "Шалгуур үзүүлэлтийн текст...",
          "indicators": ["Хэмжих үзүүлэлт 1", "Хэмжих үзүүлэлт 2"],
          "scoreOptions": "5,4,3,2,0"
        }
      ]
    }
  ]
}`;

export default function CriteriaAdminClient() {
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/criteria").then((r) => r.json());
      setChapters(res.chapters ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitImport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("JSON форматад алдаа байна");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/criteria/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа");
        return;
      }
      setSuccess(true);
      setJson("");
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Бүлэг</th>
              <th className="px-4 py-2">Дэд бүлэг</th>
              <th className="px-4 py-2">Шалгуур</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chapters.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2.5 font-medium text-slate-800">
                  {c.code}. {c.title}
                </td>
                <td className="px-4 py-2.5">{c.subChapterCount}</td>
                <td className="px-4 py-2.5">{c.criteriaCount}</td>
              </tr>
            ))}
            {!loading && chapters.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  Одоогоор бүлэг ороогүй байна.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setShowImport((v) => !v)}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        {showImport ? "Хаах" : "+ Шинэ бүлэг импортлох (JSON)"}
      </button>

      {showImport && (
        <form onSubmit={submitImport} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            А/554 тушаалын дараагийн бүлгүүдийг доорх бүтэцтэй JSON хэлбэрээр бэлдэж оруулна уу.
          </p>
          <textarea
            className="input font-mono text-xs"
            rows={14}
            placeholder={EXAMPLE}
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Амжилттай нэмэгдлээ ✓</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "Оруулж байна..." : "Импортлох"}
          </button>
        </form>
      )}
    </div>
  );
}
