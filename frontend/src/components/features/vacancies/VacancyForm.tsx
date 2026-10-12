"use client";

import { useState, type SubmitEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "@/components/layouts/NavigationLink";
import { useNavigationProgress, usePageReady } from "@/components/layouts/NavigationProgress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SearchableCombobox from "@/components/features/vacancies/SearchableCombobox";
import DescriptionEditor from "@/components/features/vacancies/DescriptionEditor";
import CurrencyInput from "@/components/features/vacancies/CurrencyInput";
import VacancyFormHero from "@/components/features/vacancies/VacancyFormHero";
import PageSkeleton from "@/components/ui/feedback/PageSkeleton";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import {
  getVacancyForEdit,
  getVacancyOptions,
  saveVacancy,
  VacancyNotFoundError,
  VacancyValidationError,
} from "@/lib/api/vacancies";
import type {
  Vacancy,
  VacancyOption,
  VacancyOptionsResponse,
  VacancyPayload,
} from "@/types/vacancy";

const descriptionTemplate =
  "<h2>Deskripsi Pekerjaan</h2><p>Sebagai [Posisi Lowongan], Anda akan berpartisipasi dalam proses pembangunan aplikasi yang sedang dibangun dalam perusahaan [Nama Perusahaan]. Anda juga diharapkan mampu bekerja dalam tim.</p><h2>Tanggung Jawab</h2><ul><li>Membuat atau memodifikasi program yang sudah ada.</li><li>Bertanggung jawab dalam mengelola program.</li></ul>";
const inputClass =
  "h-12 w-full rounded-xs border border-zinc-200 bg-white px-4 text-base leading-5.5 tracking-[-0.176px] placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none disabled:bg-zinc-50";

function jakartaDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(date);
  const part = (type: string) => parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export default function VacancyFormScreen({ id }: { id?: string }) {
  const options = useQuery({
    queryKey: ["vacancy-options"],
    queryFn: ({ signal }) => getVacancyOptions(signal),
    staleTime: 300_000,
  });
  const vacancy = useQuery({
    queryKey: ["vacancy-edit", id],
    queryFn: ({ signal }) => getVacancyForEdit(id!, signal),
    enabled: Boolean(id),
    retry: (count, error) => !(error instanceof VacancyNotFoundError) && count < 2,
  });
  const failure = options.error ?? vacancy.error;
  const loading = options.isPending || (Boolean(id) && vacancy.isPending);
  usePageReady(Boolean(failure) || !loading, id ? `/vacancies/${id}/edit` : "/vacancies/new");

  return (
    <main className="w-full bg-white text-zinc-900">
      <VacancyFormHero editing={Boolean(id)} />
      {failure ? (
        <div className="mx-auto max-w-162 px-6 py-10" role="alert">
          <p>{failure.message}</p>
          {!(failure instanceof VacancyNotFoundError) && (
            <button
              type="button"
              onClick={() => {
                void options.refetch();
                if (id) void vacancy.refetch();
              }}
              className="mt-4 cursor-pointer rounded border px-4 py-2"
            >
              Coba lagi
            </button>
          )}
          <Link href="/dashboard" className="mt-4 block text-blue-500 underline">
            Kembali ke Dashboard
          </Link>
        </div>
      ) : loading ? (
        <div className="mx-auto max-w-162 px-6 py-10">
          <PageSkeleton variant="form" />
        </div>
      ) : (
        <VacancyForm
          key={id ?? "new"}
          id={id}
          initialVacancy={vacancy.data?.data}
          options={options.data!.data}
        />
      )}
    </main>
  );
}

interface VacancyFormProps {
  id?: string;
  initialVacancy?: Vacancy;
  options: VacancyOptionsResponse["data"];
}

function VacancyForm({ id, initialVacancy, options }: VacancyFormProps) {
  const notify = useToast();
  const { navigate, pending: navigating } = useNavigationProgress();
  const queryClient = useQueryClient();
  const existingDeadline = initialVacancy ? jakartaDate(new Date(initialVacancy.expires_at)) : "";
  const locationOptions = options.locations.map((location) =>
    initialVacancy?.location.name === location.name
      ? { ...location, id: initialVacancy.location_id }
      : location,
  );
  const [values, setValues] = useState({
    title: initialVacancy?.title ?? "",
    position: initialVacancy?.position ?? "",
    employment_type: initialVacancy?.employment_type ?? "",
    candidate_count: initialVacancy ? String(initialVacancy.candidate_count) : "",
    expires_at: existingDeadline,
    location_id: initialVacancy ? String(initialVacancy.location_id) : "",
    is_remote: initialVacancy?.is_remote ?? false,
    description: initialVacancy?.description ?? descriptionTemplate,
    salary_min: initialVacancy?.salary_min != null ? String(initialVacancy.salary_min) : "",
    salary_max: initialVacancy?.salary_max != null ? String(initialVacancy.salary_max) : "",
    show_salary: initialVacancy?.show_salary ?? false,
    experience_level: initialVacancy?.experience_level ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitError, setSubmitError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const saving = useMutation({
    mutationFn: (payload: VacancyPayload) => saveVacancy(payload, id),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vacancies"] }),
        queryClient.invalidateQueries({ queryKey: ["vacancy", String(response.data.id)] }),
        queryClient.invalidateQueries({ queryKey: ["vacancy-edit", String(response.data.id)] }),
      ]);
      notify(id ? "Perubahan lowongan berhasil disimpan." : "Lowongan berhasil dibuat.");
      navigate("/dashboard");
    },
    onError: (error) => {
      if (error instanceof VacancyValidationError) setErrors(error.errors);
      if (error instanceof VacancyValidationError) {
        setSubmitError(error.message);
      } else {
        notify(error.message, "error");
      }
    },
  });
  const busy = saving.isPending || imageUploading || navigating;

  function update<K extends keyof typeof values>(name: K, value: (typeof values)[K]) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: [] }));
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = event.nativeEvent.submitter;
    if (!(submitter instanceof HTMLButtonElement) || submitter.name !== "save-vacancy") return;
    if (busy) return;
    setSubmitError("");
    setErrors({});
    saving.mutate({
      ...values,
      title: values.title.trim(),
      candidate_count: Number(values.candidate_count),
      location_id: Number(values.location_id),
      salary_min: Number(values.salary_min),
      salary_max: values.salary_max === "" ? null : Number(values.salary_max),
    });
  }

  const validity = (name: string) => ({
    "aria-invalid": Boolean(errors[name]?.length),
    "aria-describedby": `${name}-error`,
  });
  const field = (name: string, label: string, children: ReactNode, required = true) => (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-base leading-5.5 tracking-[-0.176px]">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      {children}
      {errors[name]?.length ? (
        <p id={`${name}-error`} className="text-sm text-rose-700">
          {errors[name][0]}
        </p>
      ) : null}
    </div>
  );
  const radios = (
    name: "employment_type" | "experience_level",
    label: string,
    choices: VacancyOption[],
  ) => (
    <fieldset className="space-y-3" aria-describedby={`${name}-error`}>
      <legend className="mb-2 text-base leading-5.5 tracking-[-0.176px]">
        {label} <span className="text-rose-600">*</span>
      </legend>
      {choices.map((choice) => (
        <label
          key={choice.value}
          className="flex w-fit cursor-pointer items-center gap-2 text-base leading-6 text-zinc-700"
        >
          <span className="relative flex h-6 w-6 items-center justify-center">
            <input
              type="radio"
              name={name}
              value={choice.value}
              required
              checked={values[name] === choice.value}
              onChange={() => update(name, choice.value)}
              className="peer sr-only"
              {...validity(name)}
            />
            <Image
              src="/icons/radio-outline.svg"
              alt=""
              width={22}
              height={22}
              className="peer-focus-visible:rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
            />
            {values[name] === choice.value && (
              <span className="absolute h-3 w-3 rounded-full bg-blue-500" />
            )}
          </span>
          {choice.label}
        </label>
      ))}
      {errors[name]?.length ? (
        <p id={`${name}-error`} className="text-sm text-rose-700">
          {errors[name][0]}
        </p>
      ) : null}
    </fieldset>
  );

  return (
    <form
      onSubmit={submit}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          !event.nativeEvent.isComposing &&
          event.target instanceof HTMLInputElement
        ) {
          event.preventDefault();
        }
      }}
      className="mx-auto max-w-162 px-6 pt-10 pb-16"
    >
      <fieldset disabled={busy} className="space-y-8">
        {field(
          "title",
          "Judul lowongan",
          <>
            <input
              id="title"
              name="title"
              required
              maxLength={255}
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Masukkan judul lowongan"
              className={inputClass}
              {...validity("title")}
            />
            <p className="text-sm leading-5 text-zinc-600">Contoh: Android Native Developer</p>
          </>,
        )}
        {field(
          "position",
          "Posisi",
          <SearchableCombobox
            id="position"
            value={values.position}
            options={options.positions}
            placeholder="Pilih posisi yang dicari"
            onChange={(value) => update("position", value)}
            disabled={busy}
            invalid={Boolean(errors.position?.length)}
            describedBy="position-error"
          />,
        )}
        {radios("employment_type", "Tipe pekerjaan", options.employment_types)}
        {field(
          "candidate_count",
          "Kandidat yang dibutuhkan",
          <input
            id="candidate_count"
            name="candidate_count"
            type="number"
            required
            min={1}
            max={99}
            step={1}
            value={values.candidate_count}
            onChange={(event) => update("candidate_count", event.target.value)}
            placeholder="Masukkan jumlah kandidat yang dibutuhkan"
            className={inputClass}
            {...validity("candidate_count")}
          />,
        )}
        {field(
          "expires_at",
          "Aktif hingga",
          <div className="relative">
            <input
              id="expires_at"
              name="expires_at"
              type="date"
              required
              min={
                id && values.expires_at === existingDeadline ? undefined : jakartaDate(new Date())
              }
              value={values.expires_at}
              onChange={(event) => update("expires_at", event.target.value)}
              className={`${inputClass} [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
              {...validity("expires_at")}
            />
            <Image
              src="/icons/calendar.svg"
              alt=""
              width={24}
              height={24}
              className="pointer-events-none absolute top-3 right-4"
            />
          </div>,
        )}
        {field(
          "location_id",
          "Lokasi",
          <>
            <SearchableCombobox
              id="location_id"
              value={values.location_id}
              options={locationOptions.map((location) => ({
                value: String(location.id),
                label: location.name,
              }))}
              placeholder="Pilih lokasi"
              onChange={(value) => update("location_id", value)}
              icon="/icons/form-location.svg"
              disabled={busy}
              invalid={Boolean(errors.location_id?.length)}
              describedBy="location_id-error"
            />
            <label className="flex w-fit cursor-pointer items-center gap-2 text-zinc-700">
              <input
                type="checkbox"
                checked={values.is_remote}
                onChange={(event) => update("is_remote", event.target.checked)}
                className="h-4.5 w-4.5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
              />
              Bisa remote
            </label>
          </>,
        )}
        <div className="space-y-2">
          <p className="text-base leading-5.5">
            Deskripsi <span className="text-rose-600">*</span>
          </p>
          <DescriptionEditor
            initialContent={initialVacancy?.description ?? descriptionTemplate}
            onChange={(html) => update("description", html)}
            disabled={busy}
            invalid={Boolean(errors.description?.length)}
            onUploadingChange={setImageUploading}
          />
          <p id="description-help" className="text-sm leading-5 text-zinc-600">
            Anda bisa mengubah templat yang telah disediakan di atas.
          </p>
          <p id="description-error" className="text-sm text-rose-700">
            {errors.description?.[0]}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-base leading-5.5">
            Rentang gaji per bulan <span className="text-rose-600">*</span>
          </p>
          <div className="flex items-center gap-3 sm:gap-6">
            {(["salary_min", "salary_max"] as const).map((name, index) => (
              <div
                key={name}
                className="flex min-w-0 flex-1 items-center rounded-xs border border-zinc-200"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-zinc-100 sm:w-18.5">
                  Rp
                </span>
                <CurrencyInput
                  id={name}
                  label={index === 0 ? "Gaji minimum" : "Gaji maksimum"}
                  required={index === 0}
                  minimum={index === 0 ? "0" : values.salary_min}
                  value={values[name]}
                  onChange={(value) => update(name, value)}
                  placeholder={index === 0 ? "Minimum" : "Maksimum (opsional)"}
                  invalid={Boolean(errors[name]?.length)}
                />
              </div>
            ))}
          </div>
          <p id="salary_min-error" className="text-sm text-rose-700">
            {errors.salary_min?.[0]}
          </p>
          <p id="salary_max-error" className="text-sm text-rose-700">
            {errors.salary_max?.[0]}
          </p>
          <p className="text-sm leading-5 text-zinc-600">
            Anda tidak perlu mengisi kolom &quot;Maksimum&quot; jika yang dimasukkan adalah gaji
            pokok.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={values.show_salary}
              aria-label="Tampilkan gaji"
              onClick={() => update("show_salary", !values.show_salary)}
              className="relative h-5 w-10 shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {values.show_salary ? (
                <span className="block h-5 w-10 rounded-full bg-blue-500">
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white" />
                </span>
              ) : (
                <Image src="/icons/salary-toggle-off.svg" alt="" width={40} height={20} />
              )}
            </button>
            <span className="text-zinc-600">Tampilkan gaji</span>
          </div>
          <p className="text-sm leading-5 text-zinc-600">
            Gaji akan ditampilkan di lowongan pekerjaan dan dapat dilihat oleh kandidat.
          </p>
        </div>
        {radios("experience_level", "Minimum pengalaman bekerja", options.experience_levels)}
        {submitError && (
          <p role="alert" className="text-sm text-rose-700">
            {submitError}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            name="save-vacancy"
            disabled={busy}
            className="cursor-pointer rounded-xs bg-[#2d3e50] px-6 py-2 text-base leading-6 text-white disabled:cursor-wait disabled:opacity-60"
          >
            {imageUploading
              ? "Mengunggah gambar..."
              : saving.isPending
                ? "Menyimpan..."
                : id
                  ? "Simpan perubahan"
                  : "Buat lowongan"}
          </button>
          <Link
            href="/dashboard"
            aria-disabled={busy}
            onClick={(event) => {
              if (busy) event.preventDefault();
            }}
            className="rounded-xs border border-zinc-200 bg-zinc-50 px-5 py-2 text-base leading-6 text-zinc-700"
          >
            Batal
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
