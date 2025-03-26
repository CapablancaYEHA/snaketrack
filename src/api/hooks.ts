import { supabase } from "@/lib/client_supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash-es";
import { nanoid } from "nanoid";
import { toDataUrl } from "@/utils/supabaseImg";
import { dateToSupabaseTime } from "../utils/time";
import { EQuKeys, ESupabase, IReqCreateBP, IResSnakesList, ISupabaseErr } from "./models";

const httpGetGenes = async () => {
  let a = await supabase.from(ESupabase.bpgenes).select("*");
  return a.data;
};

export function useGenes() {
  return useQuery<any, ISupabaseErr>({
    queryKey: [EQuKeys.COMP_BP],
    queryFn: () => httpGetGenes(),
    enabled: true,
  });
}

/* TODO FIXME поправить policy. Update фото может сделать только юзер по имени папки
 AND (( SELECT auth.uid() AS uid) = id) = (storage.foldername('snakepics'))[1]
 */
export const httpUldSnPic = (file: File) => {
  const userId: string = localStorage.getItem("USER")!;
  return supabase.storage.from(ESupabase.snakepics).upload(`${userId}/${nanoid(8)}`, file);
};

/* FIXME Супабейз рекомендует при замене файлов update({upsert:true}) не перезаписывать его а создавать новый path а старый файл и путь удалять*/
// Для лого отдельный бакет?
// Может вместо одного бакета snakepics - сделать категории - питоны, удавы и  Бакет для логотипов заводчиков?
export const httpCreateBp = async (a: IReqCreateBP) => {
  let genes = isEmpty(a.genes) ? [{ label: "Normal", gene: "other" }] : a.genes;
  let l = a.feed_last_at != null ? dateToSupabaseTime(a.feed_last_at) : null;
  let d = {
    ...a,
    genes,
    date_hatch: dateToSupabaseTime(a.date_hatch),
    feeding: [
      {
        feed_last_at: l,
        feed_weight: a.feed_weight,
        feed_ko: a.feed_ko,
        feed_comment: a.feed_comment,
      },
    ],
  };
  delete d.feed_last_at;
  delete d.feed_weight;
  delete d.feed_ko;
  delete d.feed_comment;
  return await supabase.from(ESupabase.ballpythons).insert(d).select("id").single<{ id: string }>();
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
  return await supabase.from(ESupabase.ballpythons).update(a.upd).eq("id", a.id);
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

// TODO нужно модиф эту функцию когда появятся новые категории змей
const httpGetSnakesList = async (list: string[]) => {
  let a = await supabase.from(ESupabase.ballpythons).select().in("id", list);
  return a.data;
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
  let a = await supabase.from(ESupabase.ballpythons).select("*").eq("id", id).limit(1).single();
  return a.data;
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

export const httpTransferSnake = async (username: string, snekId: string) =>
  supabase.rpc("transfer_snake", {
    trg_user: username,
    trg_snake: snekId,
    action: "transfer",
  });

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
