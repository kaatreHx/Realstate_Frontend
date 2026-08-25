export type PropertyDocumentType =
  | "ownership_deed"
  | "land_survey"
  | "tax_clearance"
  | "other";

export interface PropertyDocument {
  id: string;
  type: PropertyDocumentType;
  file: File;
}
