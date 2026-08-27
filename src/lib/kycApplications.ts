import type { KycState } from "@/types/kyc";

export interface KycApplication extends KycState {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
}

// Mocked signed-in seller (matches the mock profile in PersonalDetailsSection)
// until real auth wires the profile page up to a logged-in user id.
export const CURRENT_SELLER_ID = "u-seller-1";

const STORAGE_KEY = "meridian_kyc_applications";

// Local persistence so an admin's decision on /admin/kyc is visible on the
// seller's /profile page without a backend. Replace with a real fetch to
// GET/PATCH `${API_BASE_URL}/admin/kyc` once that endpoint exists.
export function loadKycApplications(): KycApplication[] {
  if (typeof window === "undefined") return MOCK_KYC_APPLICATIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as KycApplication[];
  } catch {
    // malformed/unavailable storage — fall back to the seed data below
  }
  return MOCK_KYC_APPLICATIONS;
}

export function saveKycApplications(applications: KycApplication[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch {
    // storage unavailable (private browsing, quota) — decision still applies for this session
  }
}

export function getKycApplicationForUser(
  applications: KycApplication[],
  userId: string
): KycApplication | undefined {
  return applications.find((app) => app.userId === userId);
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
