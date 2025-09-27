import { signal } from "@preact/signals";
import { ECategories } from "@/api/common";

const vis = localStorage.getItem("REMS_VISITED") as ECategories;

export const sigIsModOpen = signal<boolean>(false);
export const sigCurDate = signal<Date | undefined>(undefined);
export const sigDeletedId = signal<string | undefined>(undefined);
export const sigCurCat = signal<ECategories>(vis ?? ECategories.BP);
