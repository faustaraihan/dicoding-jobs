import { Suspense } from "react";
import VacancyList from "@/components/features/vacancies/VacancyList";
import PageSkeleton from "@/components/ui/feedback/PageSkeleton";

export default function ListPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" />}>
      <VacancyList />
    </Suspense>
  );
}
