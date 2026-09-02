import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";
import type { KycState, KycSubmission } from "@/types/kyc";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? "Something went wrong. Please try again."
    );
  }

  return res.json() as Promise<T>;
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>("/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return request<AuthResponse>("/auth/register", payload);
}

export async function submitKyc(
  payload: KycSubmission,
  files: { front: File | null; back: File | null; selfie: File | null }
): Promise<KycState> {
  const formData = new FormData();

  // Personal Identity
  formData.append("firstName", payload.firstName);
  if (payload.middleName) formData.append("middleName", payload.middleName);
  formData.append("lastName", payload.lastName);
  formData.append("dob", payload.dob);
  formData.append("gender", payload.gender);

  // Identity Document Details
  formData.append("documentType", payload.documentType);
  formData.append("documentNumber", payload.documentNumber);
  formData.append("documentExpiryDate", payload.documentExpiryDate);

  // Address Information
  formData.append("street", payload.street);
  formData.append("city", payload.city);
  formData.append("zip", payload.zip);

  // File Uploads (Proof) — field names must match backend's kycUpload middleware
  if (files.front) formData.append("documentFront", files.front);
  if (files.back) formData.append("documentBack", files.back);
  if (files.selfie) formData.append("selfie", files.selfie);

  const res = await fetch(`${API_BASE_URL}/kyc`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? errorBody?.message ?? "Couldn't submit your documents.");
  }

  return res.json() as Promise<KycState>;
}
