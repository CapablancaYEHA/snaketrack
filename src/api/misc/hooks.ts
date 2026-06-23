import { supabase } from "@/lib/client_supabase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { ECategories, EQuKeys, ESupabase, IFamilyTreeRes, ISupabaseErr, IVkMarketItem, categoryToMmCat } from "../common";
import { IMorphOddsReq, IMorphOddsRes } from "./models";

export const httpUldSnPic = (file: File, source: ESupabase) => {
  const userId: string = localStorage.getItem("USER")!;
  return supabase.storage.from(source).upload(`${userId}/${nanoid(8)}`, file);
};

// TODO FIXME нужно написать триггер в supabase для Update / Delete (и View?) действий чтобы была ошибка при RLS ?
export const httpReplacePic = async (url: string, file: File, source: ESupabase) => {
  const userId: string = localStorage.getItem("USER")!;
  const trgUrl = url.split("/").slice(-1);

  return supabase.storage.from(source).upload(`${userId}/${trgUrl[0]}`, file, {
    upsert: true,
    contentType: file.type,
  });
};

// Calc Odds
// const netlifyUrl = 'https://681f314fc8b548beafe901f6--morph-proxy.netlify.app/.netlify/functions/proxy?url=https://www.morphmarket.com/api/v1/calculators/calculate_offspring/';
const netlifyUrl = "https://api.hissstory.site/calculator";
const httpCalcMmOdds = async (p1: string[], p2: string[], categ): Promise<IMorphOddsRes> => {
  let res;
  //   eslint-disable-next-line no-useless-catch
  try {
    let d = (await fetch(netlifyUrl, {
      method: "POST",
      body: JSON.stringify({ category: categoryToMmCat[categ], links_to: "morphs", parent1: p1, parent2: p2 }),
      headers: {
        "Content-Type": "application/json",
      },
    })) as any;
    if (!d.ok) {
      const err = await d.json();
      throw err;
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

// FIXME удалить старую версию "rpc_snake_family_tree"
const httpGetTree = async (id, category) => {
  const { data, error } = await supabase.rpc("rpc_snake_family_tree_v2", {
    target_id: id,
    category,
  });
  if (error) {
    throw error;
  }
  return data;
};

export function useFamilyTree(id: string, category, isEnabled = true) {
  return useQuery<any, ISupabaseErr, IFamilyTreeRes>({
    queryKey: [EQuKeys.FAM_TREE, id, category],
    queryFn: () => httpGetTree(id, category),
    enabled: isEnabled,
  });
}

export const httpVkMarket = async (url: string): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const k = await fetch("http://localhost:80/api/auth", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "content-type": "application/json",
      },
    });
    return k.json();
  } catch (e) {
    throw e;
  }
};

export function useVkMarket() {
  return useMutation<IVkMarketItem[], ISupabaseErr, any>({
    mutationFn: (a) => httpVkMarket(a),
  });
}

export const httpPayment = async (id: string, returnUri = window.location.href): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const k = await fetch("http://localhost:80/api/payment", {
      method: "POST",
      body: JSON.stringify({ id, returnUri }),
      headers: {
        "content-type": "application/json",
      },
    });
    return k.json();

    // return k;
  } catch (e) {
    throw e;
  }
};

export function useInitPayment() {
  return useMutation<any, { message?: string }, string>({
    mutationFn: (id) => httpPayment(id),
    mutationKey: ["yoomoney"],
    retry: 1,
  });
}
