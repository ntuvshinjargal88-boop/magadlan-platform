"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-100"
    >
      Гарах
    </button>
  );
}
