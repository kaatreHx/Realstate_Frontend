export type KycStatus = "not_submitted" | "PENDING" | "APPROVED" | "REJECTED";

export type KycDocumentType =
  | "NATIONAL_ID"
  | "CITIZENSHIP"
  | "PASSPORT"
  | "DRIVERS_LICENSE";

export type KycGender = "MALE" | "FEMALE" | "OTHER";

export interface KycSubmission {
  // Personal Identity
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string; // ISO date string, e.g. "1998-05-12"
  gender: KycGender;

  // Identity Document Details
  documentType: KycDocumentType;
  documentNumber: string;
  documentExpiryDate: string; // ISO date string

  // Address Information
  street: string;
  city: string;
  zip: string;

  // File Uploads (Proof) — file names only, for display/local state
  documentFrontFileName: string | null;
  documentBackFileName: string | null;
  selfieFileName: string | null;
}

export interface KycState extends KycSubmission {
  status: KycStatus;
  submittedAt: string | null;
  rejectReason?: string | null;
}
