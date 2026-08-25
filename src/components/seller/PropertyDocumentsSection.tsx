"use client";

import { useRef } from "react";
import type { PropertyDocument, PropertyDocumentType } from "@/types/property-document";
import styles from "./PropertyDocumentsSection.module.css";

const DOCUMENT_OPTIONS: { value: PropertyDocumentType; label: string }[] = [
  { value: "ownership_deed", label: "Ownership deed / lalpurja" },
  { value: "land_survey", label: "Land survey / naksa" },
  { value: "tax_clearance", label: "Tax clearance certificate" },
  { value: "other", label: "Other" },
];

interface PropertyDocumentsSectionProps {
  documents: PropertyDocument[];
  onChange: (documents: PropertyDocument[]) => void;
}

export default function PropertyDocumentsSection({
  documents,
  onChange,
}: PropertyDocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const additions: PropertyDocument[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      type: "other",
      file,
    }));
    onChange([...documents, ...additions]);
  }

  function updateType(id: string, type: PropertyDocumentType) {
    onChange(documents.map((doc) => (doc.id === id ? { ...doc, type } : doc)));
  }

  function removeDoc(id: string) {
    onChange(documents.filter((doc) => doc.id !== id));
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Supporting documents</h2>
      <p className={styles.description}>
        Add ownership proof and other paperwork buyers may ask for —
        ownership deed, land survey, or a tax clearance certificate. PDF,
        JPG, or PNG, under 10MB each.
      </p>

      <button
        type="button"
        className={styles.dropzone}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className={styles.dropzoneIcon}>+</span>
        <span className={styles.dropzoneText}>Upload documents</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf,image/png,image/jpeg"
        className={styles.hiddenInput}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {documents.length > 0 && (
        <ul className={styles.list}>
          {documents.map((doc) => (
            <li key={doc.id} className={styles.row}>
              <span className={styles.fileName} title={doc.file.name}>
                {doc.file.name}
              </span>

              <select
                className={styles.select}
                value={doc.type}
                onChange={(e) =>
                  updateType(doc.id, e.target.value as PropertyDocumentType)
                }
              >
                {DOCUMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeDoc(doc.id)}
                aria-label={`Remove ${doc.file.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
