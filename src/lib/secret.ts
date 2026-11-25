// Сешний гарын үсгийн нууц — НЭГ газраас (auth.ts, proxy.ts хоёул эндээс).
//
// ЯАГААД: өмнө нь JWT_SECRET тавиагүй бол кодонд бичсэн анхдагч утгаар гарын үсэг зурдаг
// байв. Сан нийтэд нээлттэй тул тэр утгыг мэдэх хэн ч админы сешн хуурамчаар үүсгэж чадна.
// Одоо production-д нууц байхгүй бол хүсэлт алдаа өгнө — анхдагч утгаар чимээгүй ажиллахгүй.
const DEV_ONLY = "dev-only-secret-not-for-production";

export function jwtSecret(): Uint8Array {
  const v = process.env.JWT_SECRET || "";
  if (process.env.NODE_ENV === "production") {
    // Хоосон бол хүсэлт бүр алдаа өгнө (хуурамч сешн хүлээж авахаас дээр).
    if (!v) throw new Error("JWT_SECRET тохируулаагүй байна");
    if (v.length < 32) console.error("JWT_SECRET 32 тэмдэгтээс богино — уртасгана уу.");
    return new TextEncoder().encode(v);
  }
  return new TextEncoder().encode(v || DEV_ONLY);
}
