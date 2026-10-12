import Image from "next/image";

export default function VacancyFormHero({ editing }: { editing: boolean }) {
  return (
    <section className="bg-zinc-900 text-white" aria-labelledby="vacancy-form-heading">
      <div className="mx-auto max-w-290 px-6 py-18">
        <div className="flex flex-wrap items-center gap-4">
          <h1
            id="vacancy-form-heading"
            className="text-[32px] leading-14 font-semibold tracking-[-0.88px] sm:text-[40px]"
          >
            {editing ? "Edit lowongan pekerjaan" : "Buat lowongan pekerjaan"}
          </h1>
          <span
            aria-hidden="true"
            className="relative h-15.25 w-50.75 shrink-0 overflow-hidden rounded-full"
          >
            <Image
              src="/images/jobs-hero.png"
              alt=""
              width={203}
              height={136}
              className="absolute -top-3.75 left-0 h-34 w-50.75 object-cover"
            />
          </span>
        </div>
        <p className="mt-3 text-base leading-5.5 tracking-[-0.176px]">
          Dicoding Jobs menghubungkan industri dengan talenta yang tepat.
          <br />
          Mencari tim baru tidak harus melelahkan dan boros biaya.
        </p>
      </div>
    </section>
  );
}
