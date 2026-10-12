import { notFound } from "next/navigation";
import { Suspense } from "react";
import VacancyFormScreen from "@/components/features/vacancies/VacancyForm";
import LoadingEditVacancy from "./loading";

export default function EditVacancyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingEditVacancy />}>
      <EditVacancyContent params={params} />
    </Suspense>
  );
}

async function EditVacancyContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return <VacancyFormScreen id={id} />;
}
