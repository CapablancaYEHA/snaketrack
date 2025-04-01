import { supabase } from "@/lib/client_supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { upgAlias } from "@/components/genetics/const";
import { toDataUrl } from "@/utils/supabaseImg";
import { EQuKeys, ESupabase, IFeed, IReqCreateBP, IResSnakesList, ISupabaseErr } from "./models";

const httpGetGenes = async () => {
  const { data, error } = await supabase.from(ESupabase.bpgenes).select("*").throwOnError();
  if (error) {
    throw error;
  }
  return upgAlias(data);
};

export function useGenes() {
  return useQuery<any, ISupabaseErr>({
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
  return supabase.storage.from(ESupabase.snakepics).upload(`${userId}/${nanoid(8)}`, file);
};

export const httpReplacePic = async (url: string, file: File) => {
  const userId: string = localStorage.getItem("USER")!;
  const { data, error } = await supabase.storage.from(ESupabase.snakepics).remove([`${userId}/${url.split("/").slice(-1)}`]);
  if (data?.length === 0 || error) throw { message: "Не удалось обновить картинку" };
  return supabase.storage.from(ESupabase.snakepics).upload(`${userId}/${nanoid(8)}`, file);
};

// Может вместо одного бакета snakepics - сделать категории - питоны, удавы и  Бакет для логотипов заводчиков?
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

export const httpUpdFeeding = async (id, feed, mass) => {
  const { data, error } = await supabase.rpc("append_feeding_ballpython", {
    trg_snake: id,
    feeding_obj: feed,
    weight_obj: mass,
    action: "update",
  });
  if (error) {
    throw error;
  }
  return data;
};

type IFeedReq = {
  id: string;
  feed: IFeed;
  mass: { date: string; weight: number };
};

export function useUpdateFeeding() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IFeedReq>({
    mutationFn: ({ id, feed, mass }) => httpUpdFeeding(id, feed, mass),
    onSuccess: () => {
      // FIXME Когда на индивид странице рега, тоже надо делать
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

export function useSnake(id: string) {
  return useQuery<any, ISupabaseErr, IResSnakesList>({
    queryKey: [EQuKeys.LIST_BP, id],
    queryFn: () => httpGetSingleSnake(id),
    enabled: true,
  });
}

type IReqTransfer = {
  username: string;
  snekId: string;
};

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
