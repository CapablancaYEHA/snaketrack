import { disStats } from "@/components/common/Market/utils";
import { ESupabase } from "../common";

export const hnList = (userId) => ({ t: ESupabase.HN, f: (b) => b.eq("owner_id", userId), id: userId });
export const hnRemList = (userId) => ({ t: ESupabase.HN, f: (b) => b.eq("owner_id", userId).filter("status", "not.in", `(${disStats.join(",")})`), id: [userId, disStats.join(" ,")] });

export const hnSingle = (id) => ({ t: ESupabase.HN, f: (b) => b.eq("id", id).limit(1).single(), id });
