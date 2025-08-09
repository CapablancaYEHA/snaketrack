import { signal } from "@preact/signals";

export const sigSelected = signal<string[]>([]);
export const sigIsModOpen = signal<boolean>(false);
export const sigCurDate = signal<Date | undefined>(undefined);
