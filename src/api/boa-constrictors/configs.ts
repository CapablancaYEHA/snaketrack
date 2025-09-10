import { ESupabase } from "../common";

export const bcList = (userId) => ({ t: ESupabase.BC, f: (b) => b.eq("owner_id", userId) });

export const bcSingle = (id) => ({ t: ESupabase.BC, f: (b) => b.eq("id", id).limit(1).single(), id });
