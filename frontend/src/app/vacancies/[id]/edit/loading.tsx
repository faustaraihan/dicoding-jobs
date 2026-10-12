import PageSkeleton from "@/components/ui/feedback/PageSkeleton";
import VacancyFormHero from "@/components/features/vacancies/VacancyFormHero";

export default function LoadingEditVacancy() {
  return (
    <main className="w-full bg-white text-zinc-900">
      <VacancyFormHero editing />
      <div className="mx-auto max-w-162 px-6 py-10">
        <PageSkeleton variant="form" />
      </div>
    </main>
  );
}
