import { ESupabase } from "../common";

export const csList = (userId) => ({ t: ESupabase.CS, f: (b) => b.eq("owner_id", userId), id: userId });

export const csSingle = (id) => ({ t: ESupabase.CS, f: (b) => b.eq("id", id).limit(1).single(), id });
