import { signal } from "@preact/signals";

export const sigIsModOpen = signal<boolean>(false);
export const sigCurDate = signal<Date | undefined>(undefined);
export const sigDeletedId = signal<string | undefined>(undefined);
