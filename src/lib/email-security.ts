import { DISPOSABLE_DOMAINS } from "./disposable-domains";

export function validateEmailDomain(email: string): string | null {
  if (!email || typeof email !== "string") return null;
  const parts = email.toLowerCase().split("@");
  if (parts.length !== 2) return null;
  return parts[1];
}

export function isDisposableEmail(email: string): boolean {
  const domain = validateEmailDomain(email);
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}
