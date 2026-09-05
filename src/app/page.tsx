import Link from "next/link";

const features = [
  {
    title: "Шалгуур үзүүлэлт бүрийг хянах",
    desc: "ЭМ-ийн сайдын А/554 тушаалын магадлан шинжлэх шалгуурыг бүлэг, дэд бүлэг, шалгуур үзүүлэлтээр нь бүтэцтэй харуулж, тус бүрийг хангасан эсэхийг тэмдэглэнэ.",
  },
  {
    title: "Тушаал, журам upload",
    desc: "Байгууллагын мөрдөж буй тушаал, журам, стандартын баримт бичгийг оруулж, тодорхой шалгуур үзүүлэлттэй холбож нотлох баримт болгоно.",
  },
  {
    title: "Олон эмнэлэгт зориулсан",
    desc: "Эмнэлэг бүр өөрийн бүртгэлтэй, өгөгдөл нь тусдаа хадгалагдана. Нэг платформыг олон байгууллага зэрэг ашиглах боломжтой.",
  },
  {
    title: "Явцын тайлан, дүн шинжилгээ",
    desc: "Дэд бүлэг тус бүрийн биелэлтийн хувь, нийт бэлэн байдлыг хянах самбар.",
  },
];

export default function Home() {
  return (
    <div className="flex-1">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-sky-700">МагадланПро</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Нэвтрэх
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700"
            >
              Эмнэлгээ бүртгүүлэх
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-3 inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Эрүүл мэндийн сайдын 2019.12.06 А/554 тоот тушаалд үндэслэсэн
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Магадлан итгэмжлэлийн шалгуурыг хангах явцыг нэг дороос удирдъя
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Эрүүл мэндийн байгууллагад зориулсан удирдлагын цахим платформ — шалгуур үзүүлэлт бүрийн биелэлтийг
            бүртгэж, холбогдох тушаал журмыг баримтжуулж, магадлан шинжлэх шалгалтад бэлэн байдлаа тодорхой харна.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/register"
              className="rounded-md bg-sky-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-sky-700"
            >
              Үнэгүй эхлэх
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              Аль хэдийн бүртгэлтэй
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} МагадланПро
      </footer>
    </div>
  );
}
