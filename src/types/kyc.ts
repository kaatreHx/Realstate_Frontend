export type KycStatus = "not_submitted" | "pending" | "verified" | "rejected";

export type KycDocumentType = "citizenship" | "passport" | "national_id";

export interface KycSubmission {
  documentType: KycDocumentType;
  documentNumber: string;
  fullNameOnDocument: string;
  frontFileName: string | null;
  backFileName: string | null;
}

export interface KycState extends KycSubmission {
  status: KycStatus;
  submittedAt: string | null;
  note?: string;
}
