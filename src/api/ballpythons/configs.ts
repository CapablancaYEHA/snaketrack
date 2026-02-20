import { disStats } from "@/components/common/Market/utils";
import { ESupabase } from "../common";

// FIXME Нужно прикрутить\проверить пагинацию к спискам змей?
export const bpList = (userId) => ({ t: ESupabase.BP, f: (b) => b.eq("owner_id", userId), id: userId });
export const bpRemList = (userId) => ({ t: ESupabase.BP, f: (b) => b.eq("owner_id", userId).filter("status", "not.in", `(${disStats.join(",")})`), id: [userId, disStats.join(" ,")] });

export const bpSingle = (id) => ({ t: ESupabase.BP, f: (b) => b.eq("id", id).limit(1).single(), id });
