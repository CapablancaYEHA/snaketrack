import { signal } from "@preact/signals";

export const enum EAuth {
  FULL = "email_pass",
  MAIL = "email",
}

export const sigRegister = signal<EAuth>(EAuth.MAIL);
