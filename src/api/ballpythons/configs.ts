import { ESupabase } from "../common";

// FIXME Нужно прикрутить\проверить пагинацию к спискам змей?

// TODO к Спискам добавить neq("status", "archived") если определился с введением статусов
export const bpList = (userId) => ({ t: ESupabase.BP, f: (b) => b.eq("owner_id", userId), id: userId });

export const bpSingle = (id) => ({ t: ESupabase.BP, f: (b) => b.eq("id", id).limit(1).single(), id });

export const bpBreedList = (userId) => ({ t: ESupabase.BP_BREED_V, f: (b) => b.eq("owner_id", userId), id: userId });

export const bpBreedSingle = (id) => ({ t: ESupabase.BP_BREED_V, f: (b) => b.eq("id", id).limit(1).single(), id });

export const bpClutchList = (userId) => ({ t: ESupabase.BP_CL_V, f: (b) => b.eq("owner_id", userId), id: userId });

export const bpClutchSingle = (id) => ({ t: ESupabase.BP_CL_V, f: (b) => b.eq("id", id).limit(1).single(), id });
