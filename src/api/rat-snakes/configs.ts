import { disStats } from "@/components/common/Market/utils";
import { ESupabase } from "../common";

export const rsList = (userId) => ({ t: ESupabase.RS, f: (b) => b.eq("owner_id", userId), id: userId });
export const rsRemList = (userId) => ({ t: ESupabase.RS, f: (b) => b.eq("owner_id", userId).filter("status", "not.in", `(${disStats.join(",")})`), id: [userId, disStats.join(" ,")] });

export const rsSingle = (id) => ({ t: ESupabase.RS, f: (b) => b.eq("id", id).limit(1).single(), id });
