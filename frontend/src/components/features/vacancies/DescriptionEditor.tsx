"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { uploadVacancyImage } from "@/lib/api/vacancies";
import { LinkSelection, linkSelectionKey } from "@/lib/utils/editorLinkSelection";
import { useToast } from "@/components/ui/feedback/ToastProvider";

interface DescriptionEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  invalid: boolean;
  disabled: boolean;
  onUploadingChange: (uploading: boolean) => void;
}

export default function DescriptionEditor({
  initialContent,
  onChange,
  invalid,
  disabled,
  onUploadingChange,
}: DescriptionEditorProps) {
  const notify = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [sourceMode, setSourceMode] = useState(false);
  const [source, setSource] = useState(initialContent);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, protocols: ["http", "https", "mailto"] },
      }),
      TiptapImage.configure({ allowBase64: false }),
      LinkSelection,
    ],
    immediatelyRender: false,
    content: initialContent,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Deskripsi",
        "aria-multiline": "true",
        "aria-describedby": "description-error description-help",
        "aria-invalid": String(invalid),
        "aria-required": "true",
        class: "vacancy-description min-h-85 p-4 text-sm leading-5 outline-none",
      },
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);

  async function insertImage(file?: File) {
    if (!file || !editor || disabled || uploading) return;
    setImageError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("File harus berupa gambar JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Ukuran gambar maksimal 2 MB.");
      return;
    }
    setUploading(true);
    onUploadingChange(true);
    try {
      const src = await uploadVacancyImage(file);
      if (!editor.isDestroyed) {
        editor.chain().focus().setImage({ src, alt: file.name }).run();
        notify("Gambar berhasil diunggah.");
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Gagal mengunggah gambar. Coba lagi.");
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  }

  const controls: {
    label: string;
    action?: () => void;
    spriteOffset?: number;
    icon?: string;
    imagePicker?: boolean;
    preserveSelection?: boolean;
  }[] = [
    {
      label: "Tebal",
      spriteOffset: 0,
      action: () => {
        editor?.chain().focus().toggleBold().run();
      },
    },
    {
      label: "Miring",
      spriteOffset: 40,
      action: () => {
        editor?.chain().focus().toggleItalic().run();
      },
    },
    {
      label: "Garis bawah",
      spriteOffset: 80,
      action: () => {
        editor?.chain().focus().toggleUnderline().run();
      },
    },
    {
      label: "Judul",
      icon: "/icons/editor-heading.svg",
      action: () => {
        editor?.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      label: "Daftar",
      icon: "/icons/editor-list.svg",
      action: () => {
        editor?.chain().focus().toggleBulletList().run();
      },
    },
    {
      label: "Tautan",
      spriteOffset: 128,
      preserveSelection: true,
      action: () => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        editor.view.dispatch(
          editor.state.tr.setMeta(linkSelectionKey, showLinkInput ? null : { from, to }),
        );
        setLinkUrl(String(editor.getAttributes("link").href ?? ""));
        setShowLinkInput(!showLinkInput);
      },
    },
    { label: "Sisipkan gambar", spriteOffset: 168, imagePicker: true },
    {
      label: "Edit HTML",
      spriteOffset: 208,
      action: () => {
        if (editor) editor.view.dispatch(editor.state.tr.setMeta(linkSelectionKey, null));
        setShowLinkInput(false);
        if (sourceMode) {
          editor?.commands.setContent(source);
          onChange(editor?.getHTML() ?? source);
        } else {
          setSource(editor?.getHTML() ?? initialContent);
        }
        setSourceMode(!sourceMode);
      },
    },
  ];

  return (
    <div className={`rounded-xs border ${invalid ? "border-rose-600" : "border-zinc-200"}`}>
      <div
        className="flex flex-wrap items-center gap-4 border-b border-zinc-200 px-4 py-1"
        role="group"
        aria-label="Format deskripsi"
      >
        {controls.map((control, index) => (
          <span key={control.label} className="inline-flex items-center gap-4">
            {index === 5 && <span aria-hidden="true" className="h-4 w-px bg-zinc-300" />}
            <button
              type="button"
              aria-label={control.label}
              title={control.label}
              disabled={
                !editor || disabled || uploading || (sourceMode && control.label !== "Edit HTML")
              }
              onMouseDown={(event) => {
                if (control.preserveSelection) event.preventDefault();
              }}
              onClick={() => {
                if (control.imagePicker) imageInputRef.current?.click();
                else control.action?.();
              }}
              className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-sm hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {control.icon ? (
                <Image src={control.icon} alt="" width={16} height={16} />
              ) : (
                <span aria-hidden="true" className="relative block h-4 w-4 overflow-hidden">
                  <Image
                    src="/icons/editor-toolbar.svg"
                    alt=""
                    width={224}
                    height={16}
                    className="absolute top-0 max-w-none"
                    style={{ left: -(control.spriteOffset ?? 0) }}
                  />
                </span>
              )}
            </button>
          </span>
        ))}
      </div>
      <input
        ref={imageInputRef}
        aria-label="Pilih gambar deskripsi"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void insertImage(file);
        }}
      />
      {uploading && (
        <p
          role="status"
          className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600"
        >
          Mengunggah gambar...
        </p>
      )}
      {imageError && (
        <p role="alert" className="border-b border-zinc-200 px-4 py-3 text-sm text-rose-700">
          {imageError}
        </p>
      )}
      {showLinkInput && !sourceMode && (
        <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center">
          <input
            aria-label="Alamat tautan"
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://contoh.com"
            className="h-10 w-full min-w-0 rounded-xs border border-zinc-200 bg-white px-3 text-sm leading-5 text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none sm:flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (!editor || (linkUrl.trim() && !/^(https?:\/\/|mailto:)/i.test(linkUrl.trim())))
                return;
              const range = linkSelectionKey.getState(editor.state) ?? editor.state.selection;
              const command = editor
                .chain()
                .focus()
                .setTextSelection({ from: range.from, to: range.to })
                .extendMarkRange("link");
              if (!linkUrl.trim()) command.unsetLink().run();
              else command.setLink({ href: linkUrl.trim() }).run();
              editor.view.dispatch(editor.state.tr.setMeta(linkSelectionKey, null));
              setShowLinkInput(false);
            }}
            className="h-10 shrink-0 cursor-pointer rounded-xs border border-zinc-200 bg-white px-5 text-sm leading-5 font-normal text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
          >
            Terapkan
          </button>
        </div>
      )}
      {sourceMode ? (
        <textarea
          aria-label="HTML deskripsi"
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            onChange(event.target.value);
          }}
          className="min-h-85 w-full resize-y p-4 font-mono text-sm outline-none"
        />
      ) : (
        <EditorContent editor={editor} className="max-h-125 overflow-y-auto" />
      )}
    </div>
  );
}
