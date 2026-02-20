import { disStats } from "@/components/common/Market/utils";
import { ESupabase } from "../common";

export const csList = (userId) => ({ t: ESupabase.CS, f: (b) => b.eq("owner_id", userId), id: userId });
export const csRemList = (userId) => ({ t: ESupabase.BP, f: (b) => b.eq("owner_id", userId).filter("status", "not.in", `(${disStats.join(",")})`), id: userId });

export const csSingle = (id) => ({ t: ESupabase.CS, f: (b) => b.eq("id", id).limit(1).single(), id });
