import { dateToSupabaseTime, getEndOf, getStartOf } from "@/utils/time";
import { ESupabase, categoryToBaseTable } from "./common";

export const snakeListByGender = (categ, sex, avoidId, userId) => ({ t: categoryToBaseTable[categ], f: (b) => b.eq("owner_id", userId).eq("sex", sex).neq("id", avoidId), id: [userId, sex, avoidId] });

export const remList = (userId) => ({ t: ESupabase.REM_V, f: (b) => b.eq("owner_id", userId), o: { refetchOnWindowFocus: true }, id: userId });

export const remsByDate = (time) => ({ t: ESupabase.REM_V, f: (b) => b.gte("scheduled_time", dateToSupabaseTime(getStartOf(time))).lte("scheduled_time", dateToSupabaseTime(getEndOf(time))), id: dateToSupabaseTime(time) });

export const marketAvailSnakes = (userId, c) => ({ t: categoryToBaseTable[c], s: "id, snake_name", f: (b) => b.eq("owner_id", userId).filter("status", "in", "(collection,isolation)"), id: [userId, "limited"] });

export const marketSingle = (id) => ({ t: ESupabase.MRKT_V, f: (b) => b.eq("id", id).limit(1).single(), id });
