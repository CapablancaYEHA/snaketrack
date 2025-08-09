import { useCallback } from "preact/hooks";
import { supabase } from "@/lib/client_supabase";
import { UseQueryResult, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { upgAlias } from "@/components/genetics/const";
import { toDataUrl } from "@/utils/supabaseImg";
import { dateToSupabaseTime } from "@/utils/time";
import {
  EQuKeys,
  ESupabase,
  IFeed,
  IGenesBpComp,
  IMorphOddsReq,
  IMorphOddsRes,
  IRemindersReq,
  IRemindersRes,
  IReqCreateBP,
  IReqCreateBPBreed,
  IReqCreateBpClutch,
  IReqUpdBpClutch,
  IResBpBreedingList,
  IResBpClutch,
  IResSnakesList,
  ISupabaseErr,
  IUpdClutchReq,
} from "./models";

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
    staleTime: 60000 * 60 * 4, // 4 часа
  });
}

/* TODO FIXME поправить policy. Update фото может сделать только юзер по имени папки
 AND (( SELECT auth.uid() AS uid) = id) = (storage.foldername('snakepics'))[1]
 */
export const httpUldSnPic = (file: File) => {
  const userId: string = localStorage.getItem("USER")!;
  return supabase.storage.from(ESupabase["bp-pics"]).upload(`${userId}/${nanoid(8)}`, file);
};

// TODO FIXME нужно написать триггер в supabase для Update / Delete (и View?) действий чтобы была ошибка при RLS
export const httpReplacePic = async (url: string, file: File) => {
  const userId: string = localStorage.getItem("USER")!;
  const { error } = await supabase.storage.from(ESupabase["bp-pics"]).remove([`${userId}/${url.split("/").slice(-1)}`]);
  if (error) {
    throw { message: "Не удалось обновить картинку" };
  }
  return supabase.storage.from(ESupabase["bp-pics"]).upload(`${userId}/${nanoid(8)}`, file);
};

// Create
const httpCreateBp = async (a: IReqCreateBP | IReqCreateBP[]) => {
  return await supabase.from(ESupabase.ballpythons).insert(a).select("id").single<{ id: string }>().throwOnError();
};

export function useCreateBp() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqCreateBP>({
    mutationFn: (a) => httpCreateBp(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP],
      });
    },
  });
}
type IUpdReq = {
  upd: Partial<IReqCreateBP>;
  id: string;
};

// Update
const httpUpdateBp = async (a: IUpdReq) => {
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

// Feeding
const httpUpdFeeding = async (id, feed, mass, shed) => {
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

// Get All Snakes
// TODO нужно модиф эту функцию когда появятся новые категории змей
const httpGetSnakesList = async (owner_id) => {
  const { data, error } = await supabase.from(ESupabase.ballpythons).select().eq("owner_id", owner_id);
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
export function useSnakesList(owner: string, isEnabled: boolean) {
  return useQuery<any, ISupabaseErr, IResSnakesList[]>({
    queryKey: [EQuKeys.LIST_BP, owner],
    queryFn: () => httpGetSnakesList(owner),
    enabled: isEnabled,
  });
}

// Get Single
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

// TODO Нужно написать триггеры на удаление из массивов в Breeding и Clutch
//В Клатч сделана ошибка, что впринципе не можешь удалить змею из активной кладки или плана
// Может тогда вместо удаления, сделать возможность только перевести в Архив (аналогично статусу "Умер") ? Это значит что змее никаким образом нельзя апдейтить содержимое профиля
// + её больше нельзя выбрать в планах и кладках, но в уже созданных она останется
const httpDeleteBpBSnake = async (snakeId: string) => await supabase.from(ESupabase.ballpythons).delete().eq("id", snakeId).throwOnError();

export function useDeleteBpSnake() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, string>({
    mutationFn: (a) => httpDeleteBpBSnake(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP],
      });
    },
  });
}

export type TSnakeQueue = UseQueryResult<IResSnakesList[], ISupabaseErr>;

// Get multiple by IDs
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

// Transfer
// FIXME Перестать бояться и переделать функцию RPC на работу с uuid?
const httpTransferSnake = async (username: string, snekId: string) => {
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
        queryKey: [EQuKeys.LIST_BP],
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

// Get Breeding
const httpGetBpBreedingList = async (owner_id: string) => {
  const { data, error } = await supabase.from(ESupabase.bp_breeding_joined).select().eq("owner_id", owner_id);
  if (error) {
    throw error;
  }
  return data;
};

export function useBpBreedingList(owner: string, isEnabled: boolean) {
  return useQuery<any, ISupabaseErr, IResBpBreedingList[]>({
    queryKey: [EQuKeys.LIST_BP_BREED, owner],
    queryFn: () => httpGetBpBreedingList(owner),
    enabled: isEnabled,
  });
}

// Create Breed
const httpCreateBpBreed = async (a: IReqCreateBPBreed) => {
  return await supabase.from(ESupabase.bp_breeding).insert(a).select("id").single<{ id: string }>().throwOnError();
};

export function useCreateBpBreed() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqCreateBPBreed>({
    mutationFn: (a) => httpCreateBpBreed(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP_BREED],
      });
    },
  });
}

// Calc Odds
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

// Get SIngle Breed
const httpGetSingleBpBreed = async (id: string): Promise<IResBpBreedingList> => {
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

// Update Breed
const httpUpdateBpBreed = async (a: IUpdBreedReq) => {
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

// Delete Breed
const httpDeleteBpBreed = async (breedId: string) => await supabase.from(ESupabase.bp_breeding).delete().eq("id", breedId).throwOnError();

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

// Create CLutch
const httpCreateBpClutch = async (a: IReqCreateBpClutch) => {
  return await supabase.from(ESupabase.bp_clutch).insert(a).select("id").single<{ id: string }>().throwOnError();
};

const isFreshBreedTG = (val: IUpdBreedReq | IReqCreateBPBreed): val is IReqCreateBPBreed => {
  return typeof (val as IReqCreateBPBreed).owner_id !== "undefined";
};

const makeClutchFromBpBreed = async (pl: IUpdBreedReq | IReqCreateBPBreed) => {
  const userId: string = localStorage.getItem("USER")!;
  if (isFreshBreedTG(pl)) {
    const { data: breedRow, error } = await httpCreateBpBreed(pl);
    if (error) {
      throw error;
    }
    const payload: IReqCreateBpClutch = {
      males_ids: pl.males_ids,
      female_id: pl.female_id,
      owner_id: userId,
      date_laid: dateToSupabaseTime(new Date()),
    };
    const { data, error: errClutch } = await httpCreateBpClutch(payload);
    if (errClutch) {
      throw errClutch;
    }
    const clutchId = data.id;
    const { error: breedErr } = await httpUpdateBpBreed({ id: breedRow.id, upd: { status: "clutch", clutch_id: clutchId } });
    if (breedErr) {
      throw breedErr;
    }
    return data;
  }
  const trg = pl.id;

  const dt = await httpGetSingleBpBreed(trg);
  if (!dt) {
    throw { message: "Не удалось получить детализацию плана. Возможно, он был удалён" };
  }
  const payload: IReqCreateBpClutch = {
    males_ids: dt.breed_males_ids,
    female_id: dt.female_id,
    owner_id: userId,
    date_laid: dateToSupabaseTime(new Date()),
  };
  const { data, error: errClutch } = await httpCreateBpClutch(payload);
  if (errClutch) {
    throw errClutch;
  }
  const clutchId = data.id;
  const { error } = await httpUpdateBpBreed({ id: trg, upd: { ...pl.upd, status: "clutch", clutch_id: clutchId } });
  if (error) {
    throw error;
  }
  return data;
};

export function useMakeClutchFromBreed() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, ISupabaseErr, IUpdBreedReq | IReqCreateBPBreed>({
    mutationFn: (a) => makeClutchFromBpBreed(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP_BREED],
      });
    },
  });
}

// Get Single Clutch
const httpGetSingleBpClutch = async (id: string): Promise<IResBpBreedingList> => {
  const { data, error } = await supabase.from(ESupabase.bp_clutch_joined).select("*").eq("id", id).limit(1).single();
  if (error) {
    throw error;
  }
  return data;
};

export function useSingleBpClutch(id: string, isEnabled = true) {
  return useQuery<any, ISupabaseErr, IResBpClutch>({
    queryKey: [EQuKeys.LIST_BP_CLUTCH, id],
    queryFn: () => httpGetSingleBpClutch(id),
    enabled: isEnabled,
  });
}

const httpGetClutchesList = async (owner_id) => {
  const { data, error } = await supabase.from(ESupabase.bp_clutch_joined).select("*").eq("owner_id", owner_id);
  if (error) {
    throw error;
  }
  return data;
};

export function useBpClutches(owner_id: string, isEnabled = true) {
  return useQuery<any, ISupabaseErr, IResBpClutch[]>({
    queryKey: [EQuKeys.LIST_BP_CLUTCH, owner_id],
    queryFn: () => httpGetClutchesList(owner_id),
    enabled: isEnabled,
  });
}

// Update Clutch
const httpUpdateBpClutch = async (a: IReqUpdBpClutch) => {
  return await supabase.from(ESupabase.bp_clutch).update(a.upd).eq("id", a.id).throwOnError();
};

export function useUpdateBpClutch(id: string) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqUpdBpClutch>({
    mutationFn: (a) => httpUpdateBpClutch(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP_CLUTCH, id],
        exact: true,
      });
    },
  });
}

// TODO Триггер в БД на обновление таблицы связей запускать только для определенной роли юзера?
// Для заплатившего юзера, чтобы не забивать таблицу и не строить потом древо для всех подряд
interface IFinaliseClutchReq {
  snakes: IReqCreateBP[];
  clutchUpd: IReqUpdBpClutch;
}
type IFinaliseClutchRes = {
  id: string;
}[];
const httpFinaliseClutch = async (args: IFinaliseClutchReq): Promise<IFinaliseClutchRes> => {
  const { data, error: insertError } = await supabase.from(ESupabase.ballpythons).insert(args.snakes).select("id").throwOnError();
  if (insertError) {
    throw insertError;
  }
  const { error } = await httpUpdateBpClutch({ upd: args.clutchUpd.upd as any, id: args.clutchUpd.id });
  if (error) {
    throw error;
  }
  return data;
};

export function useFinaliseBpClutch(id: string) {
  const queryClient = useQueryClient();
  return useMutation<IFinaliseClutchRes, ISupabaseErr, IFinaliseClutchReq>({
    mutationFn: (a) => httpFinaliseClutch(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.LIST_BP_CLUTCH, id, EQuKeys.LIST_BP],
        exact: true,
      });
    },
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

// Reminders
const httpGetReminders = async (owner_id: string): Promise<IRemindersRes[]> => {
  const { data, error } = await supabase.from(ESupabase.reminders).select("*").eq("owner_id", owner_id);
  if (error) {
    throw error;
  }
  return data;
};

export function useReminders(owner: string, isEnabled: boolean) {
  return useQuery<any, ISupabaseErr, IRemindersRes[]>({
    queryKey: [EQuKeys.REMIND, owner],
    queryFn: () => httpGetReminders(owner),
    enabled: isEnabled,
  });
}

const httpCreateReminder = async (a: IRemindersReq) => {
  return await supabase.from(ESupabase.reminders).insert(a).select("id").single<{ id: string }>().throwOnError();
};

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IRemindersReq>({
    mutationFn: (a) => httpCreateReminder(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.REMIND],
      });
    },
  });
}

const httpDeleteReminder = async (id: string) => await supabase.from(ESupabase.reminders).delete().eq("id", id).throwOnError();

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, string>({
    mutationFn: (a) => httpDeleteReminder(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EQuKeys.REMIND],
      });
    },
  });
}
