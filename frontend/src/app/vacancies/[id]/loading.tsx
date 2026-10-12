import PageSkeleton from "@/components/ui/feedback/PageSkeleton";

export default function LoadingVacancy() {
  return (
    <main className="mx-auto w-full max-w-194.5 px-6 py-12">
      <PageSkeleton variant="detail" />
    </main>
  );
}
