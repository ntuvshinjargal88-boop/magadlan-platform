"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    orgName: "",
    registerNumber: "",
    phone: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Эмнэлгээ бүртгүүлэх</h1>
      <p className="mt-1 text-sm text-slate-600">
        Шинэ байгууллагын бүртгэл үүсгэж, эхний админ хэрэглэгчээр өөрийгөө бүртгүүлнэ.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Эмнэлгийн нэр" required>
          <input
            className="input"
            value={form.orgName}
            onChange={(e) => update("orgName", e.target.value)}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Регистрийн дугаар">
            <input
              className="input"
              value={form.registerNumber}
              onChange={(e) => update("registerNumber", e.target.value)}
            />
          </Field>
          <Field label="Утасны дугаар">
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
        </div>

        <hr className="border-slate-200" />

        <Field label="Таны нэр" required>
          <input
            className="input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </Field>
        <Field label="И-мэйл" required>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </Field>
        <Field label="Нууц үг" required>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={6}
            required
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sky-600 px-4 py-2.5 font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Бүртгэлтэй хэрэглэгч үү?{" "}
        <Link href="/login" className="font-medium text-sky-700 hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
