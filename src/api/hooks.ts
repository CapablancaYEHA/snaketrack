import { useCallback } from "preact/hooks";
import { supabase } from "@/lib/client_supabase";
import { UseQueryResult, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { upgAlias } from "@/components/genetics/const";
import { toDataUrl } from "@/utils/supabaseImg";
import { EQuKeys, ESupabase, IFeed, IGenesBpComp, IMorphOddsReq, IMorphOddsRes, IReqCreateBP, IReqCreateBPBreed, IResBpBreedingList, IResSnakesList, ISupabaseErr } from "./models";

const httpGetGenes = async () => {
  const { data, error } = await supabase.from(ESupabase.bpgenes).select("*").throwOnError();
  if (error) {
    throw error;
  }
  return upgAlias(data);
};

export function useGenes() {
  return useQuery<IGenesBpComp[], ISupabaseErr>({
    queryKey: [EQuKeys.COMP_BP],
    queryFn: () => httpGetGenes(),
    enabled: true,
    staleTime: 60000 * 60 * 4,
  });
}

/* TODO FIXME поправить policy. Update фото может сделать только юзер по имени папки
 AND (( SELECT auth.uid() AS uid) = id) = (storage.foldername('snakepics'))[1]
 */
export const httpUldSnPic = (file: File) => {
  const userId: string = localStorage.getItem("USER")!;
  return supabase.storage.from(ESupabase["bp-pics"]).upload(`${userId}/${nanoid(8)}`, file);
};

export const httpReplacePic = async (url: string, file: File) => {
  const userId: string = localStorage.getItem("USER")!;
  const { error } = await supabase.storage.from(ESupabase["bp-pics"]).remove([`${userId}/${url.split("/").slice(-1)}`]);
  if (error) {
    throw { message: "Не удалось обновить картинку" };
  }
  return supabase.storage.from(ESupabase["bp-pics"]).upload(`${userId}/${nanoid(8)}`, file);
};

export const httpCreateBp = async (a: IReqCreateBP) => {
  return await supabase.from(ESupabase.ballpythons).insert(a).select("id").single<{ id: string }>().throwOnError();
};

export function useCreateBp() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqCreateBP>({
    mutationFn: (a) => httpCreateBp(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.PROFILE],
      });
    },
  });
}
type IUpdReq = {
  upd: Partial<IReqCreateBP>;
  id: string;
};
export const httpUpdateBp = async (a: IUpdReq) => {
  return await supabase.from(ESupabase.ballpythons).update(a.upd).eq("id", a.id).throwOnError();
};

export function useUpdateBp() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IUpdReq>({
    mutationFn: (o) => httpUpdateBp(o),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP],
      });
    },
  });
}

export const httpUpdFeeding = async (id, feed, mass, shed) => {
  const { data, error } = await supabase.rpc("append_feeding_ballpython", {
    trg_snake: id,
    feeding_obj: feed,
    weight_obj: mass,
    new_shed: shed,
    action: "update",
  });
  if (error) {
    throw error;
  }
  return data;
};

type IFeedReq = {
  id: string;
  feed: IFeed | null;
  mass: { date: string; weight: number } | null;
  shed: string | null;
};

export function useUpdateFeeding() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IFeedReq>({
    mutationFn: ({ id, feed, mass, shed }) => httpUpdFeeding(id, feed, mass, shed),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP],
      });
    },
  });
}

// TODO нужно модиф эту функцию когда появятся новые категории змей
const httpGetSnakesList = async (list: string[]) => {
  const { data, error } = await supabase.from(ESupabase.ballpythons).select().in("id", list);
  if (error) {
    throw error;
  }
  return data;
};

/* FIXME? нужно ли создать view для этой таблицы?
Это ок если юзер запросил своих змей и видит их айдишники через свой профиль, но если в будущем можно будет заходить на страницы других челов
и запрашивать их змей - то есть риск засветить айдишник юзера?
*/
// FIXME Нужно прикрутить\проверить пагинацию к этой и подобным?
export function useSnakesList(list: string[], isEnabled: boolean) {
  return useQuery<any, ISupabaseErr, IResSnakesList[]>({
    queryKey: [EQuKeys.LIST_BP, list],
    queryFn: () => httpGetSnakesList(list),
    enabled: isEnabled,
  });
}

const httpGetSingleSnake = async (id: string) => {
  const { data, error } = await supabase.from(ESupabase.ballpythons).select("*").eq("id", id).limit(1).single();
  if (error) {
    throw error;
  }
  return data;
};

export function useSnake(id: string, isEnabled = true) {
  return useQuery<any, ISupabaseErr, IResSnakesList>({
    queryKey: [EQuKeys.LIST_BP, id],
    queryFn: () => httpGetSingleSnake(id),
    enabled: isEnabled,
  });
}

export type TSnakeQueue = UseQueryResult<IResSnakesList[], ISupabaseErr>;

export function useSnakeQueue(snakes: (string | undefined)[]) {
  const memoCombine = useCallback((results) => ({ data: results.map((result) => result.data), isPending: results.some((result) => result.isPending), isError: results.some((result) => result.isError) }), []);
  return useQueries({
    queries: snakes
      ?.filter((el, ind, self) => self.indexOf(el) === ind)
      .map((id) => ({
        queryKey: [EQuKeys.LIST_BP, "queue", id],
        queryFn: () => httpGetSingleSnake(id!),
        enabled: snakes != null && snakes?.length > 0,
      })),
    combine: memoCombine,
  });
}

type IReqTransfer = {
  username: string;
  snekId: string;
};

// FIXME Перестать бояться и переделать функцию RPC на работу с uuid?
export const httpTransferSnake = async (username: string, snekId: string) => {
  const { data, error } = await supabase.rpc("transfer_snake", {
    trg_user: username,
    trg_snake: snekId,
    action: "transfer",
  });
  if (error) {
    throw error;
  }
  return data;
};

export function useTransferSnake() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqTransfer>({
    mutationFn: ({ username, snekId }) => httpTransferSnake(username, snekId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.PROFILE],
      });
    },
  });
}

export function useBase64(url: string, flag: boolean) {
  return useQuery<any, ISupabaseErr, string>({
    queryKey: ["base64", url],
    queryFn: () => toDataUrl(url),
    enabled: flag,
  });
}

const httpGetBpBreedingList = async (list: string[]) => {
  const { data, error } = await supabase.from(ESupabase.bp_breeding_joined).select().in("id", list);
  if (error) {
    throw error;
  }
  return data;
};

export function useBpBreedingList(list: string[], isEnabled: boolean) {
  return useQuery<any, ISupabaseErr, IResBpBreedingList[]>({
    queryKey: [EQuKeys.LIST_BP_BREED, list],
    queryFn: () => httpGetBpBreedingList(list),
    enabled: isEnabled,
  });
}
export const httpCreateBpBreed = async (a: IReqCreateBPBreed) => {
  return await supabase.from(ESupabase.bp_breeding).insert(a).select("id").single<{ id: string }>().throwOnError();
};

export function useCreateBpBreed() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqCreateBPBreed>({
    mutationFn: (a) => httpCreateBpBreed(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.PROFILE],
      });
    },
  });
}

const httpCalcOdds = async (p1: string[], p2: string[]): Promise<IMorphOddsRes> => {
  let res;
  //   eslint-disable-next-line no-useless-catch
  try {
    let d = (await fetch(" https://681f314fc8b548beafe901f6--morph-proxy.netlify.app/.netlify/functions/proxy?url=https://www.morphmarket.com/api/v1/calculators/calculate_offspring/", {
      method: "POST",
      body: JSON.stringify({ category: "bps", links_to: "morphs", parent1: p1, parent2: p2 }),
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

export function useCalcOdds() {
  return useMutation<IMorphOddsRes, any, IMorphOddsReq>({
    mutationFn: ({ p1, p2 }) => httpCalcOdds(p1, p2),
  });
}

const httpGetSingleBpBreed = async (id: string) => {
  const { data, error } = await supabase.from(ESupabase.bp_breeding_joined).select("*").eq("id", id).limit(1).single();
  if (error) {
    throw error;
  }
  return data;
};

export function useSingleBpBreed(id: string, isEnabled = true) {
  return useQuery<any, ISupabaseErr, IResBpBreedingList>({
    queryKey: [EQuKeys.LIST_BP_BREED, id],
    queryFn: () => httpGetSingleBpBreed(id),
    enabled: isEnabled,
  });
}

export type IUpdBreedReq = {
  upd: Partial<IReqCreateBPBreed>;
  id: string;
};

export const httpUpdateBpBreed = async (a: IUpdBreedReq) => {
  return await supabase.from(ESupabase.bp_breeding).update(a.upd).eq("id", a.id).throwOnError();
};

export function useUpdateBpBreed() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IUpdBreedReq>({
    mutationFn: (a) => httpUpdateBpBreed(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP_BREED],
      });
    },
  });
}

export const httpDeleteBpBreed = async (breedId: string) => await supabase.from(ESupabase.bp_breeding).delete().eq("id", breedId).throwOnError();

export function useDeleteBpBreed() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, string>({
    mutationFn: (a) => httpDeleteBpBreed(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP_BREED],
      });
    },
  });
}
