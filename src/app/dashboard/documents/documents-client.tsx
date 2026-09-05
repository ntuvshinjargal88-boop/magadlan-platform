"use client";

import { useEffect, useState } from "react";

type CriterionFlat = { id: string; code: string; title: string };
type DocItem = {
  id: string;
  title: string;
  category: string;
  docNumber: string | null;
  issueDate: string | null;
  description: string | null;
  fileName: string;
  fileSize: number;
  createdAt: string;
  linkedCriteria: { id: string; code: string; title: string }[];
};

const CATEGORIES = ["Тушаал", "Журам", "Стандарт", "Гэрчилгээ", "Бусад"];

export default function DocumentsClient() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [allCriteria, setAllCriteria] = useState<CriterionFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [docsRes, critRes] = await Promise.all([
        fetch("/api/documents").then((r) => r.json()),
        fetch("/api/criteria/flat").then((r) => r.json()),
      ]);
      setDocs(docsRes.documents ?? []);
      setAllCriteria(critRes.criteria ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          {showForm ? "Хаах" : "+ Баримт бичиг нэмэх"}
        </button>
      </div>

      {showForm && (
        <UploadForm
          allCriteria={allCriteria}
          onDone={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Ачааллаж байна...</p>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} allCriteria={allCriteria} onChange={load} />
          ))}
          {docs.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Одоогоор баримт бичиг ороогүй байна.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function UploadForm({
  allCriteria,
  onDone,
}: {
  allCriteria: CriterionFlat[];
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [docNumber, setDocNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = allCriteria.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file || !title) {
      setError("Файл болон гарчгийг заавал бөглөнө үү");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("category", category);
      fd.set("docNumber", docNumber);
      fd.set("issueDate", issueDate);
      fd.set("description", description);
      fd.set("file", file);
      fd.set("criterionIds", JSON.stringify(Array.from(selected)));

      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа");
        return;
      }
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Гарчиг *</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Ангилал</span>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Дугаар</span>
          <input className="input" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="ж: А/554" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Батлагдсан огноо</span>
          <input type="date" className="input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Тайлбар</span>
        <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Файл (PDF, Word гэх мэт) *</span>
        <input
          type="file"
          className="input"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          required
        />
      </label>

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Холбогдох шалгуур үзүүлэлт {selected.size > 0 && `(${selected.size} сонгосон)`}
        </span>
        <input
          className="input mb-2"
          placeholder="Хайх..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-2">
          {filtered.slice(0, 100).map((c) => (
            <label key={c.id} className="flex items-start gap-2 py-1 text-sm">
              <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="mt-1" />
              <span>
                <span className="font-medium text-slate-500">{c.code}</span> {c.title}
              </span>
            </label>
          ))}
          {filtered.length === 0 && <p className="p-2 text-sm text-slate-400">Олдсонгүй</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {saving ? "Байршуулж байна..." : "Оруулах"}
      </button>
    </form>
  );
}

function DocRow({
  doc,
  allCriteria,
  onChange,
}: {
  doc: DocItem;
  allCriteria: CriterionFlat[];
  onChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [linking, setLinking] = useState(false);
  const [pick, setPick] = useState("");

  async function removeDoc() {
    if (!confirm("Устгах уу?")) return;
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    onChange();
  }

  async function addLink() {
    if (!pick) return;
    await fetch(`/api/documents/${doc.id}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criterionId: pick }),
    });
    setPick("");
    setLinking(false);
    onChange();
  }

  async function removeLink(criterionId: string) {
    await fetch(`/api/documents/${doc.id}/links/${criterionId}`, { method: "DELETE" });
    onChange();
  }

  const linkedIds = new Set(doc.linkedCriteria.map((c) => c.id));
  const pickable = allCriteria.filter((c) => !linkedIds.has(c.id));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-slate-900">{doc.title}</p>
          <p className="text-xs text-slate-500">
            {doc.category}
            {doc.docNumber ? ` · ${doc.docNumber}` : ""}
            {doc.issueDate ? ` · ${doc.issueDate}` : ""} · {(doc.fileSize / 1024).toFixed(0)} KB
          </p>
          {doc.description && <p className="mt-1 text-sm text-slate-600">{doc.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2 text-sm">
          <a
            href={`/api/documents/${doc.id}/file`}
            target="_blank"
            className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
          >
            Нээх
          </a>
          <button onClick={removeDoc} className="rounded-md border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50">
            Устгах
          </button>
        </div>
      </div>

      <div className="mt-3">
        <button onClick={() => setExpanded((v) => !v)} className="text-xs font-medium text-sky-700 hover:underline">
          Холбогдох шалгуур ({doc.linkedCriteria.length}) {expanded ? "▲" : "▼"}
        </button>
        {expanded && (
          <div className="mt-2 space-y-2">
            <ul className="space-y-1">
              {doc.linkedCriteria.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium text-slate-500">{c.code}</span> {c.title}
                  </span>
                  <button onClick={() => removeLink(c.id)} className="text-xs text-red-500 hover:underline">
                    Хасах
                  </button>
                </li>
              ))}
              {doc.linkedCriteria.length === 0 && (
                <li className="text-sm text-slate-400">Холбогдсон шалгуур алга</li>
              )}
            </ul>
            {linking ? (
              <div className="flex gap-2">
                <select className="input" value={pick} onChange={(e) => setPick(e.target.value)}>
                  <option value="">Шалгуур сонгох...</option>
                  {pickable.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title.slice(0, 60)}
                    </option>
                  ))}
                </select>
                <button onClick={addLink} className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white">
                  Нэмэх
                </button>
              </div>
            ) : (
              <button onClick={() => setLinking(true)} className="text-xs text-sky-700 hover:underline">
                + Шалгуур холбох
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
