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
  files: { front: File | null; back: File | null }
): Promise<KycState> {
  const formData = new FormData();
  formData.append("documentType", payload.documentType);
  formData.append("documentNumber", payload.documentNumber);
  formData.append("fullNameOnDocument", payload.fullNameOnDocument);
  if (files.front) formData.append("frontFile", files.front);
  if (files.back) formData.append("backFile", files.back);

  const res = await fetch(`${API_BASE_URL}/users/me/kyc`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message ?? "Couldn't submit your documents.");
  }

  return res.json() as Promise<KycState>;
}
