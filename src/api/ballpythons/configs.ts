import { dateToSupabaseTime, getEndOf, getStartOf } from "@/utils/time";
import { ESupabase } from "../common";

/* FIXME? нужно ли создать view для таблицы змей */
// FIXME Нужно прикрутить\проверить пагинацию к этой и подобным?

// TODO к Спискам добавить neq("status", "archived")
export const bpList = (userId) => ({ t: ESupabase.BP, f: (b) => b.eq("owner_id", userId), id: userId });

export const bpSingle = (id) => ({ t: ESupabase.BP, f: (b) => b.eq("id", id).limit(1).single(), id });

export const bpBreedList = (userId) => ({ t: ESupabase.BP_BREED_V, f: (b) => b.eq("owner_id", userId), id: userId });

export const bpBreedSingle = (id) => ({ t: ESupabase.BP_BREED_V, f: (b) => b.eq("id", id).limit(1).single(), id });

export const bpClutchList = (userId) => ({ t: ESupabase.BP_CL_V, f: (b) => b.eq("owner_id", userId), id: userId });

export const bpClutchSingle = (id) => ({ t: ESupabase.BP_CL_V, f: (b) => b.eq("id", id).limit(1).single(), id });

export const remList = (userId) => ({ t: ESupabase.REM_V, f: (b) => b.eq("owner_id", userId), id: userId });

export const remsByDate = (time) => ({ t: ESupabase.REM_V, f: (b) => b.gte("scheduled_time", dateToSupabaseTime(getStartOf(time))).lte("scheduled_time", dateToSupabaseTime(getEndOf(time))), id: dateToSupabaseTime(time) });
