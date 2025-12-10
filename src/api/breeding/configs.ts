import { ECategories, ESupaBreed, categoryToShort } from "../common";

export const breedList = (userId, category: ECategories) => ({ t: ESupaBreed[`${categoryToShort[category].toUpperCase()}_BREED_V`], f: (b) => b.eq("owner_id", userId), id: userId });

export const breedSingle = (id, category: ECategories) => ({ t: ESupaBreed[`${categoryToShort[category].toUpperCase()}_BREED_V`], f: (b) => b.eq("id", id).limit(1).single(), id });

export const clutchList = (userId, category: ECategories) => ({ t: ESupaBreed[`${categoryToShort[category].toUpperCase()}_CL_V`], f: (b) => b.eq("owner_id", userId), id: userId });

export const clutchSingle = (id, category: ECategories) => ({ t: ESupaBreed[`${categoryToShort[category].toUpperCase()}_CL_V`], f: (b) => b.eq("id", id).limit(1).single(), id });
