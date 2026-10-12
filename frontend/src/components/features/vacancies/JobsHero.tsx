import Image from "next/image";

export default function JobsHero() {
  return (
    <section aria-labelledby="jobs-heading" className="bg-zinc-900 text-white">
      <div className="mx-auto max-w-290 px-6 py-12">
        <p className="text-xl leading-7 font-semibold tracking-[-0.34px] text-blue-500">
          Dicoding Jobs
        </p>

        <h1
          id="jobs-heading"
          className="mt-4 text-[32px] leading-normal font-semibold tracking-[-1.5px] sm:text-[40px] sm:tracking-[-2.2px]"
        >
          <span className="block">Temukan lowongan yang</span>

          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>cocok untuk kamu</span>

            <span
              aria-hidden="true"
              className="relative block h-15.25 w-50.75 shrink-0 overflow-hidden rounded-full"
            >
              <Image
                src="/images/jobs-hero.png"
                alt=""
                width={203}
                height={136}
                className="absolute -top-3.75 left-0 h-34 w-50.75 object-cover"
              />
            </span>
          </span>
        </h1>
      </div>
    </section>
  );
}
