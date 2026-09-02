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
    firstName: "Asha",
    lastName: "Gurung",
    dob: "1994-03-11",
    gender: "FEMALE",
    documentType: "CITIZENSHIP",
    documentNumber: "12-34-56-78901",
    documentExpiryDate: "2032-01-01",
    street: "14 Ring Road",
    city: "Kathmandu",
    zip: "44600",
    documentFrontFileName: "citizenship-front.jpg",
    documentBackFileName: "citizenship-back.jpg",
    selfieFileName: "selfie.jpg",
    status: "PENDING",
    submittedAt: "2026-08-24T10:12:00Z",
  },
  {
    id: "kyc-2",
    userId: "u-seller-2",
    userName: "Bikash Shrestha",
    userEmail: "bikash.shrestha@meridian.test",
    firstName: "Bikash",
    lastName: "Shrestha",
    dob: "1990-11-02",
    gender: "MALE",
    documentType: "PASSPORT",
    documentNumber: "PA0492817",
    documentExpiryDate: "2029-06-15",
    street: "22 Jhamsikhel",
    city: "Lalitpur",
    zip: "44700",
    documentFrontFileName: "passport-photo-page.jpg",
    documentBackFileName: null,
    selfieFileName: "selfie.jpg",
    status: "APPROVED",
    submittedAt: "2026-07-02T09:30:00Z",
    rejectReason: null,
  },
  {
    id: "kyc-3",
    userId: "u-seller-3",
    userName: "Priya Maharjan",
    userEmail: "priya.maharjan@meridian.test",
    firstName: "Priya",
    middleName: "M.",
    lastName: "Maharjan",
    dob: "1997-05-19",
    gender: "FEMALE",
    documentType: "NATIONAL_ID",
    documentNumber: "NID-3391882",
    documentExpiryDate: "2031-09-01",
    street: "5 Boudha Marg",
    city: "Kathmandu",
    zip: "44600",
    documentFrontFileName: "national-id-front.png",
    documentBackFileName: "national-id-back.png",
    selfieFileName: "selfie.png",
    status: "REJECTED",
    submittedAt: "2026-08-11T15:44:00Z",
    rejectReason: "Name on document doesn't match account name — please resubmit.",
  },
  {
    id: "kyc-4",
    userId: "u-buyer-2",
    userName: "Manish Thapa",
    userEmail: "manish.thapa@example.com",
    firstName: "Manish",
    lastName: "Thapa",
    dob: "1996-01-20",
    gender: "MALE",
    documentType: "CITIZENSHIP",
    documentNumber: "09-11-22-33445",
    documentExpiryDate: "2030-03-01",
    street: "8 New Road",
    city: "Pokhara",
    zip: "33700",
    documentFrontFileName: "citizenship-front.png",
    documentBackFileName: "citizenship-back.png",
    selfieFileName: "selfie.png",
    status: "PENDING",
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
