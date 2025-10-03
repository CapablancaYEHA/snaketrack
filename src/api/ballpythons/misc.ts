import { supabase } from "@/lib/client_supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { ECategories, EQuKeys, ESupabase, ISupabaseErr, ITransferReq, categoryToMmCat } from "../common";
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

// Transfer
const httpTransferBp = async (userId: string, snekId: string) => {
  const { data, error } = await supabase.rpc("transfer_snake", {
    trg_user: userId,
    trg_snake: snekId,
    action: "transfer",
  });
  if (error) {
    throw error;
  }
  return data;
};

export function useTransferBp() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, ITransferReq>({
    mutationFn: ({ userId, snekId }) => httpTransferBp(userId, snekId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ESupabase.BP],
      });
    },
  });
}

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
  return useQuery<any, ISupabaseErr, any[]>({
    queryKey: [EQuKeys.BP_TREE, id],
    queryFn: () => httpGetBpTree(id),
    enabled: isEnabled,
  });
}

// Market
async function httpDadata(str: string) {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
      method: "POST",
      body: JSON.stringify({
        query: str,
        from_bound: {
          value: "city",
        },
        to_bound: {
          value: "city",
        },
      }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${import.meta.env.VITE_REACT_APP_DADATA_KEY}`,
        "X-Secret": import.meta.env.VITE_REACT_APP_DADATA_SECRET,
        credentials: "include",
      },
    });

    if (!response.ok) {
      throw { message: `Response status: ${response.status}` };
    }

    const result = await response.json();
    return result.suggestions;
  } catch (error) {
    throw error;
  }
}

export function useDadata() {
  return useMutation<any, { message?: string }, string>({
    mutationFn: (a) => httpDadata(a),
  });
}
