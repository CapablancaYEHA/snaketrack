import { ESupabase } from "../common";

export const mvList = (userId) => ({ t: ESupabase.MV, f: (b) => b.eq("owner_id", userId), id: userId });

export const mvSingle = (id) => ({ t: ESupabase.MV, f: (b) => b.eq("id", id).limit(1).single(), id });
