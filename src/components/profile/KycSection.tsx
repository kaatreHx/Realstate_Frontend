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
import type { KycDocumentType, KycGender, KycStatus } from "@/types/kyc";
import styles from "./ProfileSection.module.css";
import kycStyles from "./KycSection.module.css";

const DOCUMENT_OPTIONS: { value: KycDocumentType; label: string }[] = [
  { value: "CITIZENSHIP", label: "Citizenship certificate" },
  { value: "PASSPORT", label: "Passport" },
  { value: "NATIONAL_ID", label: "National ID card" },
  { value: "DRIVERS_LICENSE", label: "Driver's license" },
];

const DOCUMENT_LABEL: Record<KycDocumentType, string> = DOCUMENT_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
  {} as Record<KycDocumentType, string>
);

const GENDER_OPTIONS: { value: KycGender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const STATUS_LABEL: Record<KycStatus, string> = {
  not_submitted: "Not submitted",
  PENDING: "Pending review",
  APPROVED: "Verified",
  REJECTED: "Rejected — resubmit",
};

type Step = 1 | 2 | 3 | 4;

const STEP_META: { step: Step; label: string; heading: string; description: string }[] = [
  {
    step: 1,
    label: "Identity",
    heading: "Personal identity",
    description: "Enter your full legal name exactly as it appears on your document.",
  },
  {
    step: 2,
    label: "Document",
    heading: "Identity document",
    description: "Tell us which document you're verifying with.",
  },
  {
    step: 3,
    label: "Address",
    heading: "Address",
    description: "Your current or permanent residential address.",
  },
  {
    step: 4,
    label: "Photos",
    heading: "Document & selfie photos",
    description: "Upload clear photos, then review everything before submitting.",
  },
];

export default function KycSection() {
  const [status, setStatus] = useState<KycStatus>("not_submitted");
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Personal Identity
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<KycGender>("MALE");

  // Identity Document Details
  const [documentType, setDocumentType] = useState<KycDocumentType>("CITIZENSHIP");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentExpiryDate, setDocumentExpiryDate] = useState("");

  // Address Information
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  // File Uploads (Proof)
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const isLocked = status === "PENDING" || status === "APPROVED";

  useEffect(() => {
    const mine = loadKycApplications().find(
      (app) => app.userId === CURRENT_SELLER_ID
    );
    if (!mine) return;
    setStatus(mine.status);
    setFirstName(mine.firstName);
    setMiddleName(mine.middleName ?? "");
    setLastName(mine.lastName);
    setDob(mine.dob);
    setGender(mine.gender);
    setDocumentType(mine.documentType);
    setDocumentNumber(mine.documentNumber);
    setDocumentExpiryDate(mine.documentExpiryDate);
    setStreet(mine.street);
    setCity(mine.city);
    setZip(mine.zip);
    setRejectionNote(mine.status === "REJECTED" ? mine.rejectReason ?? null : null);
  }, []);

  function validateStep(step: Step): string | null {
    if (step === 1) {
      if (!firstName || !lastName) return "Enter your full legal name.";
      if (!dob) return "Enter your date of birth.";
      return null;
    }
    if (step === 2) {
      if (!documentNumber) return "Enter your document number.";
      if (!documentExpiryDate) return "Enter the document's expiry date.";
      return null;
    }
    if (step === 3) {
      if (!street || !city || !zip) return "Enter your complete address.";
      return null;
    }
    if (step === 4) {
      if (!frontFile || !backFile) return "Upload clear photos of the front and back of your document.";
      if (!selfieFile) return "Upload a live selfie photo for identity verification.";
      return null;
    }
    return null;
  }

  function handleNext() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setCurrentStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }

  function handleBack() {
    setError(null);
    setCurrentStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  function goToStep(step: Step) {
    if (isLocked) return;
    if (step <= currentStep) {
      setError(null);
      setCurrentStep(step);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const validationError = validateStep(4);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitKyc(
        {
          firstName,
          middleName: middleName || undefined,
          lastName,
          dob,
          gender,
          documentType,
          documentNumber,
          documentExpiryDate,
          street,
          city,
          zip,
          documentFrontFileName: frontFile!.name,
          documentBackFileName: backFile!.name,
          selfieFileName: selfieFile!.name,
        },
        { front: frontFile, back: backFile, selfie: selfieFile }
      );
      setStatus(result.status);
      setRejectionNote(null);
      setSuccessMsg("Documents submitted. Review usually takes 1–2 business days.");
      setCurrentStep(1);

      const applications = loadKycApplications();
      const existingIndex = applications.findIndex(
        (app) => app.userId === CURRENT_SELLER_ID
      );
      const updatedApp: KycApplication = {
        id: existingIndex >= 0 ? applications[existingIndex].id : `kyc-${CURRENT_SELLER_ID}`,
        userId: CURRENT_SELLER_ID,
        userName:
          existingIndex >= 0
            ? applications[existingIndex].userName
            : `${firstName} ${lastName}`,
        userEmail: existingIndex >= 0 ? applications[existingIndex].userEmail : "",
        firstName,
        middleName: middleName || undefined,
        lastName,
        dob,
        gender,
        documentType,
        documentNumber,
        documentExpiryDate,
        street,
        city,
        zip,
        documentFrontFileName: frontFile!.name,
        documentBackFileName: backFile!.name,
        selfieFileName: selfieFile!.name,
        status: result.status,
        submittedAt: new Date().toISOString(),
        rejectReason: undefined,
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

  const activeMeta = STEP_META[currentStep - 1];

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
        {status === "REJECTED" && rejectionNote && (
          <p className={kycStyles.rejectedNote}>
            <strong>Reason for rejection:</strong> {rejectionNote}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        {isLocked && (
          <p className={kycStyles.lockedNote}>
            {status === "APPROVED"
              ? "Your identity is already verified — contact support to update your documents."
              : "Your documents are under review. You can resubmit once a decision is made."}
          </p>
        )}

        {status === "REJECTED" && (
          <p className={kycStyles.resubmitNote}>
            Update the details below based on the reason above, then resubmit for another review.
          </p>
        )}

        <div className={kycStyles.stepper}>
          {STEP_META.map((meta, i) => (
            <div
              key={meta.step}
              className={kycStyles.stepItem}
              style={{ flex: i === STEP_META.length - 1 ? "0 0 auto" : 1 }}
            >
              <button
                type="button"
                onClick={() => goToStep(meta.step)}
                className={[
                  kycStyles.stepCircle,
                  meta.step === currentStep ? kycStyles.stepCircle_active : "",
                  meta.step < currentStep ? kycStyles.stepCircle_done : "",
                ].join(" ")}
                aria-current={meta.step === currentStep}
                aria-label={`Step ${meta.step}: ${meta.label}`}
              >
                {meta.step < currentStep ? "✓" : meta.step}
              </button>
              <span
                className={[
                  kycStyles.stepLabel,
                  meta.step === currentStep ? kycStyles.stepLabel_active : "",
                ].join(" ")}
              >
                {meta.label}
              </span>
              {i < STEP_META.length - 1 && (
                <span
                  className={[
                    kycStyles.stepLine,
                    meta.step < currentStep ? kycStyles.stepLine_done : "",
                  ].join(" ")}
                />
              )}
            </div>
          ))}
        </div>

        <fieldset disabled={isLocked} className={kycStyles.fieldset}>
          <h3 className={kycStyles.stepHeading}>{activeMeta.heading}</h3>
          <p className={`${styles.description} ${kycStyles.stepDescription}`}>
            {activeMeta.description}
          </p>

          {currentStep === 1 && (
            <>
              <div className={styles.fieldRow}>
                <Input
                  label="First name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="As printed on your document"
                  required
                />
                <Input
                  label="Middle name (optional)"
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className={styles.fieldRow}>
                <Input
                  label="Last name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="As printed on your document"
                  required
                />
                <Input
                  label="Date of birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  className={styles.select}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as KycGender)}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
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
                  label="Document expiry date"
                  type="date"
                  value={documentExpiryDate}
                  onChange={(e) => setDocumentExpiryDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className={styles.field}>
                <Input
                  label="Street address"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House number and street"
                  required
                />
              </div>
              <div className={styles.fieldRow}>
                <Input
                  label="City"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
                <Input
                  label="Zip / postal code"
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="Zip / postal code"
                  required
                />
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
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
                  <label className={styles.label}>Back side</label>
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

              <div className={styles.field}>
                <label className={styles.label}>Selfie / live face photo</label>
                <button
                  type="button"
                  className={kycStyles.dropzone}
                  onClick={() => selfieInputRef.current?.click()}
                >
                  <span className={kycStyles.dropzoneIcon}>+</span>
                  <span className={kycStyles.dropzoneText}>
                    {selfieFile ? selfieFile.name : "Upload photo"}
                  </span>
                </button>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className={kycStyles.hiddenInput}
                  onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <h3 className={kycStyles.stepHeading}>Review before submitting</h3>
              <div className={kycStyles.reviewGrid}>
                <div className={kycStyles.reviewItem}>
                  <span className={kycStyles.reviewLabel}>Full name</span>
                  <span className={kycStyles.reviewValue}>
                    {[firstName, middleName, lastName].filter(Boolean).join(" ") || "—"}
                  </span>
                </div>
                <div className={kycStyles.reviewItem}>
                  <span className={kycStyles.reviewLabel}>Date of birth</span>
                  <span className={kycStyles.reviewValue}>{dob || "—"}</span>
                </div>
                <div className={kycStyles.reviewItem}>
                  <span className={kycStyles.reviewLabel}>Document</span>
                  <span className={kycStyles.reviewValue}>{DOCUMENT_LABEL[documentType]}</span>
                </div>
                <div className={kycStyles.reviewItem}>
                  <span className={kycStyles.reviewLabel}>Document number</span>
                  <span className={kycStyles.reviewValue}>{documentNumber || "—"}</span>
                </div>
                <div className={kycStyles.reviewItem}>
                  <span className={kycStyles.reviewLabel}>Expiry date</span>
                  <span className={kycStyles.reviewValue}>{documentExpiryDate || "—"}</span>
                </div>
                <div className={kycStyles.reviewItem}>
                  <span className={kycStyles.reviewLabel}>Address</span>
                  <span className={kycStyles.reviewValue}>
                    {[street, city, zip].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
              </div>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {successMsg && <p className={styles.success}>{successMsg}</p>}

          <div className={kycStyles.stepActions}>
            {currentStep > 1 && (
              <Button type="button" variant="secondary" onClick={handleBack} disabled={isLocked}>
                Back
              </Button>
            )}
            <div className={kycStyles.stepActionsRight}>
              {currentStep < 4 && (
                <Button type="button" onClick={handleNext} disabled={isLocked}>
                  Continue
                </Button>
              )}
              {currentStep === 4 && (
                <Button type="submit" isLoading={isSubmitting} disabled={isLocked}>
                  Submit for review
                </Button>
              )}
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
