import type { AdminUser } from "@/types/user";

// Replace this with a real fetch to your backend once an admin/users
// endpoint exists, e.g. GET `${API_BASE_URL}/admin/users`
export const MOCK_USERS: AdminUser[] = [
  {
    id: "u-seller-1",
    name: "Asha Gurung",
    email: "asha.gurung@meridian.test",
    role: "seller",
    joinedAt: "2025-11-02T00:00:00Z",
  },
  {
    id: "u-seller-2",
    name: "Bikash Shrestha",
    email: "bikash.shrestha@meridian.test",
    role: "seller",
    joinedAt: "2025-12-14T00:00:00Z",
  },
  {
    id: "u-seller-3",
    name: "Priya Maharjan",
    email: "priya.maharjan@meridian.test",
    role: "seller",
    joinedAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "u-buyer-1",
    name: "Sujata Rana",
    email: "sujata.rana@example.com",
    role: "buyer",
    joinedAt: "2026-06-10T00:00:00Z",
  },
  {
    id: "u-buyer-2",
    name: "Manish Thapa",
    email: "manish.thapa@example.com",
    role: "buyer",
    joinedAt: "2026-05-22T00:00:00Z",
  },
  {
    id: "u-buyer-3",
    name: "Kabita Adhikari",
    email: "kabita.a@example.com",
    role: "buyer",
    joinedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "u-buyer-4",
    name: "Rohan Basnet",
    email: "rohan.basnet@example.com",
    role: "buyer",
    joinedAt: "2026-04-18T00:00:00Z",
  },
  {
    id: "u-buyer-5",
    name: "Alina Karki",
    email: "alina.karki@example.com",
    role: "buyer",
    joinedAt: "2026-08-02T00:00:00Z",
  },
  {
    id: "u-buyer-6",
    name: "Deepak Joshi",
    email: "deepak.joshi@example.com",
    role: "buyer",
    joinedAt: "2026-08-15T00:00:00Z",
  },
];

export function formatJoinedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
