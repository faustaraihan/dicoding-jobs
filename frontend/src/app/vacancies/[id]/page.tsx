import { notFound } from "next/navigation";
import VacancyDetail from "@/components/features/vacancies/VacancyDetail";

export default async function VacancyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  return <VacancyDetail id={id} />;
}
