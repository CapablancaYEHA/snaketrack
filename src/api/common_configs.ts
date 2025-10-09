import { dateToSupabaseTime, getEndOf, getStartOf } from "@/utils/time";
import { ESupabase } from "./common";

export const remList = (userId) => ({ t: ESupabase.REM_V, f: (b) => b.eq("owner_id", userId), id: userId });

export const remsByDate = (time) => ({ t: ESupabase.REM_V, f: (b) => b.gte("scheduled_time", dateToSupabaseTime(getStartOf(time))).lte("scheduled_time", dateToSupabaseTime(getEndOf(time))), id: dateToSupabaseTime(time) });
