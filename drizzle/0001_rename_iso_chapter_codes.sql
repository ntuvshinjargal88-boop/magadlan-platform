-- ISO 15189:2024-ын бүлгүүдийн кодыг А/554-ийн өөрийн дугаарлалттай ижилхэн
-- энгийн тоон дугаарлалт руу шилжүүлэх (жишээ нь "ISO-4" -> "4").
-- Дэд бүлэг болон шалгуурын код (жинхэнэ ISO стандартын зүйл, заалтын дугаар,
-- жишээ нь "4.1", "4.2.1") хэвээр өөрчлөгдөхгүй.
-- Идемпотент: WHERE нөхцөл тохирохгүй бол юу ч өөрчлөгдөхгүй тул давхар ажиллуулахад аюулгүй.
UPDATE "chapters" SET "code" = '4' WHERE "code" = 'ISO-4';
--> statement-breakpoint
UPDATE "chapters" SET "code" = '5' WHERE "code" = 'ISO-5';
--> statement-breakpoint
UPDATE "chapters" SET "code" = '6' WHERE "code" = 'ISO-6';
--> statement-breakpoint
UPDATE "chapters" SET "code" = '7' WHERE "code" = 'ISO-7';
--> statement-breakpoint
UPDATE "chapters" SET "code" = '8' WHERE "code" = 'ISO-8';
