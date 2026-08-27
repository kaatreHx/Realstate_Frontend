import type { KycState } from "@/types/kyc";

export interface KycApplication extends KycState {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
}

// Replace this with a real fetch to your backend once an admin/kyc
// endpoint exists, e.g. GET `${API_BASE_URL}/admin/kyc`
export const MOCK_KYC_APPLICATIONS: KycApplication[] = [
  {
    id: "kyc-1",
    userId: "u-seller-1",
    userName: "Asha Gurung",
    userEmail: "asha.gurung@meridian.test",
    documentType: "citizenship",
    documentNumber: "12-34-56-78901",
    fullNameOnDocument: "Asha Gurung",
    frontFileName: "citizenship-front.jpg",
    backFileName: "citizenship-back.jpg",
    status: "pending",
    submittedAt: "2026-08-24T10:12:00Z",
  },
  {
    id: "kyc-2",
    userId: "u-seller-2",
    userName: "Bikash Shrestha",
    userEmail: "bikash.shrestha@meridian.test",
    documentType: "passport",
    documentNumber: "PA0492817",
    fullNameOnDocument: "Bikash Shrestha",
    frontFileName: "passport-photo-page.jpg",
    backFileName: null,
    status: "verified",
    submittedAt: "2026-07-02T09:30:00Z",
    note: "Verified against passport records.",
  },
  {
    id: "kyc-3",
    userId: "u-seller-3",
    userName: "Priya Maharjan",
    userEmail: "priya.maharjan@meridian.test",
    documentType: "national_id",
    documentNumber: "NID-3391882",
    fullNameOnDocument: "Priya M. Maharjan",
    frontFileName: "national-id-front.png",
    backFileName: "national-id-back.png",
    status: "rejected",
    submittedAt: "2026-08-11T15:44:00Z",
    note: "Name on document doesn't match account name — please resubmit.",
  },
  {
    id: "kyc-4",
    userId: "u-buyer-2",
    userName: "Manish Thapa",
    userEmail: "manish.thapa@example.com",
    documentType: "citizenship",
    documentNumber: "09-11-22-33445",
    fullNameOnDocument: "Manish Thapa",
    frontFileName: "citizenship-front.png",
    backFileName: "citizenship-back.png",
    status: "pending",
    submittedAt: "2026-08-25T18:20:00Z",
  },
];

export function formatSubmittedDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
