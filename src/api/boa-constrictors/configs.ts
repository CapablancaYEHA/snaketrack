import { disStats } from "@/components/common/Market/utils";
import { ESupabase } from "../common";

export const bcList = (userId) => ({ t: ESupabase.BC, f: (b) => b.eq("owner_id", userId), id: userId });
export const bcRemList = (userId) => ({ t: ESupabase.BP, f: (b) => b.eq("owner_id", userId).filter("status", "not.in", `(${disStats.join(",")})`), id: userId });

export const bcSingle = (id) => ({ t: ESupabase.BC, f: (b) => b.eq("id", id).limit(1).single(), id });
