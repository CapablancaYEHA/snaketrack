import { supabase } from "@/lib/client_supabase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { ECategories, EQuKeys, ESupabase, IFamilyTreeRes, ISupabaseErr, categoryToMmCat } from "../common";
import { IMorphOddsReq, IMorphOddsRes } from "./models";

export const httpUldSnPic = (file: File, source: ESupabase) => {
  const userId: string = localStorage.getItem("USER")!;
  return supabase.storage.from(source).upload(`${userId}/${nanoid(8)}`, file);
};

// TODO FIXME нужно написать триггер в supabase для Update / Delete (и View?) действий чтобы была ошибка при RLS
export const httpReplacePic = async (url: string, file: File, source: ESupabase) => {
  const userId: string = localStorage.getItem("USER")!;
  const { error } = await supabase.storage.from(source).remove([`${userId}/${url.split("/").slice(-1)}`]);
  if (error) {
    throw { message: "Не удалось обновить картинку" };
  }
  return supabase.storage.from(source).upload(`${userId}/${nanoid(8)}`, file);
};

// Calc Odds
const httpCalcMmOdds = async (p1: string[], p2: string[], categ): Promise<IMorphOddsRes> => {
  let res;
  //   eslint-disable-next-line no-useless-catch
  try {
    let d = (await fetch(" https://681f314fc8b548beafe901f6--morph-proxy.netlify.app/.netlify/functions/proxy?url=https://www.morphmarket.com/api/v1/calculators/calculate_offspring/", {
      method: "POST",
      body: JSON.stringify({ category: categoryToMmCat[categ], links_to: "morphs", parent1: p1, parent2: p2 }),
      headers: {
        "Content-Type": "application/json",
      },
    })) as any;
    if (!d.ok) {
      throw new Error(`Response status: ${d.status}`);
    }
    res = await d.json();
  } catch (e) {
    throw e;
  }
  return await res;
};

export function useCalcMmOdds(categ: ECategories) {
  return useMutation<IMorphOddsRes, any, IMorphOddsReq>({
    mutationFn: ({ p1, p2 }) => httpCalcMmOdds(p1, p2, categ),
  });
}

// TODO FIXME сделать универсальную rpc функцию для запросов к closure
const httpGetBpTree = async (id) => {
  const { data, error } = await supabase.rpc("rpc_bp_family_tree", {
    target_id: id,
  });
  if (error) {
    throw error;
  }
  return data;
};

export function useBpTree(id: string, isEnabled = true) {
  return useQuery<any, ISupabaseErr, IFamilyTreeRes[]>({
    queryKey: [EQuKeys.BP_TREE, id],
    queryFn: () => httpGetBpTree(id),
    enabled: isEnabled,
  });
}
