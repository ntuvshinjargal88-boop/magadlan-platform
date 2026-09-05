import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "МагадланПро — Эмнэлгийн итгэмжлэлийн удирдлагын платформ",
  description:
    "Эрүүл мэндийн байгууллагын магадлан итгэмжлэлийн шалгуур үзүүлэлтийг хянах, баримт бичиг удирдах цахим платформ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
