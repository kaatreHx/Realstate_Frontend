"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { submitKyc } from "@/lib/api";
import {
  CURRENT_SELLER_ID,
  loadKycApplications,
  saveKycApplications,
  type KycApplication,
} from "@/lib/kycApplications";
import type { KycDocumentType, KycStatus } from "@/types/kyc";
import styles from "./ProfileSection.module.css";
import kycStyles from "./KycSection.module.css";

const DOCUMENT_OPTIONS: { value: KycDocumentType; label: string }[] = [
  { value: "citizenship", label: "Citizenship certificate" },
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID card" },
];

const STATUS_LABEL: Record<KycStatus, string> = {
  not_submitted: "Not submitted",
  pending: "Pending review",
  verified: "Verified",
  rejected: "Rejected — resubmit",
};

export default function KycSection() {
  const [status, setStatus] = useState<KycStatus>("not_submitted");
  const [documentType, setDocumentType] = useState<KycDocumentType>("citizenship");
  const [documentNumber, setDocumentNumber] = useState("");
  const [fullNameOnDocument, setFullNameOnDocument] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const isLocked = status === "pending" || status === "verified";

  // Pull this seller's current KYC state (including any admin rejection
  // note) so the review outcome shows up here without a page they'd have
  // to poll a backend for.
  useEffect(() => {
    const mine = loadKycApplications().find(
      (app) => app.userId === CURRENT_SELLER_ID
    );
    if (!mine) return;
    setStatus(mine.status);
    setDocumentType(mine.documentType);
    setDocumentNumber(mine.documentNumber);
    setFullNameOnDocument(mine.fullNameOnDocument);
    setRejectionNote(mine.status === "rejected" ? mine.note ?? null : null);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!documentNumber || !fullNameOnDocument) {
      setError("Enter the document number and the name exactly as it appears on it.");
      return;
    }
    if (!frontFile) {
      setError("Upload a clear photo of the front of your document.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitKyc(
        { documentType, documentNumber, fullNameOnDocument, frontFileName: frontFile.name, backFileName: backFile?.name ?? null },
        { front: frontFile, back: backFile }
      );
      setStatus(result.status);
      setRejectionNote(null);
      setSuccessMsg("Documents submitted. Review usually takes 1–2 business days.");

      // Keep the admin review queue in sync with this (re)submission.
      const applications = loadKycApplications();
      const existingIndex = applications.findIndex(
        (app) => app.userId === CURRENT_SELLER_ID
      );
      const updatedApp: KycApplication = {
        id: existingIndex >= 0 ? applications[existingIndex].id : `kyc-${CURRENT_SELLER_ID}`,
        userId: CURRENT_SELLER_ID,
        userName: existingIndex >= 0 ? applications[existingIndex].userName : fullNameOnDocument,
        userEmail: existingIndex >= 0 ? applications[existingIndex].userEmail : "",
        documentType,
        documentNumber,
        fullNameOnDocument,
        frontFileName: frontFile.name,
        backFileName: backFile?.name ?? null,
        status: result.status,
        submittedAt: new Date().toISOString(),
        note: undefined,
      };
      if (existingIndex >= 0) {
        applications[existingIndex] = updatedApp;
      } else {
        applications.push(updatedApp);
      }
      saveKycApplications(applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your documents.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={kycStyles.stack}>
      <div className={styles.card}>
        <div className={kycStyles.statusRow}>
          <div>
            <h2 className={styles.title}>Identity verification</h2>
            <p className={styles.description}>
              Verified accounts get faster viewing approvals and can list
              properties directly.
            </p>
          </div>
          <span className={`${kycStyles.statusPill} ${kycStyles[`status_${status}`]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
        {status === "rejected" && rejectionNote && (
          <p className={kycStyles.rejectedNote}>
            <strong>Reason for rejection:</strong> {rejectionNote}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        <h2 className={styles.title}>Submit documents</h2>
        <p className={styles.description}>
          Accepted: citizenship certificate, passport, or national ID. Files
          under 10MB, JPG or PNG.
        </p>

        {isLocked && (
          <p className={kycStyles.lockedNote}>
            {status === "verified"
              ? "Your identity is already verified — contact support to update your documents."
              : "Your documents are under review. You can resubmit once a decision is made."}
          </p>
        )}

        {status === "rejected" && (
          <p className={kycStyles.resubmitNote}>
            Update the details below based on the reason above, then resubmit for another review.
          </p>
        )}

        <fieldset disabled={isLocked} className={kycStyles.fieldset}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="doc-type">
              Document type
            </label>
            <select
              id="doc-type"
              className={styles.select}
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as KycDocumentType)}
            >
              {DOCUMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldRow}>
            <Input
              label="Document number"
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g. 12-34-56-78901"
              required
            />
            <Input
              label="Full name on document"
              type="text"
              value={fullNameOnDocument}
              onChange={(e) => setFullNameOnDocument(e.target.value)}
              placeholder="As printed on the document"
              required
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Front side</label>
              <button
                type="button"
                className={kycStyles.dropzone}
                onClick={() => frontInputRef.current?.click()}
              >
                <span className={kycStyles.dropzoneIcon}>+</span>
                <span className={kycStyles.dropzoneText}>
                  {frontFile ? frontFile.name : "Upload photo"}
                </span>
              </button>
              <input
                ref={frontInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className={kycStyles.hiddenInput}
                onChange={(e) => setFrontFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Back side (if applicable)</label>
              <button
                type="button"
                className={kycStyles.dropzone}
                onClick={() => backInputRef.current?.click()}
              >
                <span className={kycStyles.dropzoneIcon}>+</span>
                <span className={kycStyles.dropzoneText}>
                  {backFile ? backFile.name : "Upload photo"}
                </span>
              </button>
              <input
                ref={backInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className={kycStyles.hiddenInput}
                onChange={(e) => setBackFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {successMsg && <p className={styles.success}>{successMsg}</p>}

          <div className={styles.actions}>
            <Button type="submit" isLoading={isSubmitting}>
              Submit for review
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
