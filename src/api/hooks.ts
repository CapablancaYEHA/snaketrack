import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash-es";
import { nanoid } from "nanoid";
import { queryClient as instance } from "../lib/client_query";
import { supabase } from "../lib/client_supabase";
import { dateToSupabaseTime } from "../utils/time";
import { IReqCreateBP, IResSnakesList, ISupabaseErr } from "./models";

//TODO Типизровать и распределить по папкам?
//TODO все имена таблиц должны быть enum

const httpGetGenes = async () => {
  let a = await supabase.from("bpgenes").select("*");
  return a.data;
};

export function useGenes() {
  return useQuery<any, any>({
    queryKey: ["pbgenes"],
    queryFn: () => httpGetGenes(),
    enabled: true,
  });
}

/* FIXME поправить policy. Update фото может сделать только юзер по имени папки
 AND (( SELECT auth.uid() AS uid) = id) = (storage.foldername('snakepics'))[1]
 */
export const httpUldSnPic = (file: File) => {
  const userId: string = localStorage.getItem("USER")!;
  return supabase.storage.from("snakepics").upload(userId + "/" + nanoid(8), file);
};

/* Супабейз рекомендует при замене файлов update({upsert:true}) не перезаписывать его а создавать новый path а старый файл и путь удалять*/
// Для лого отдельный бакет?
// Может вместо одного бакета snakepics - сделать категории - питоны, удавы и  Бакет для логотипов заводчиков?

export const httpCreateBp = (a: IReqCreateBP) => {
  let d = { ...a, genes: isEmpty(a.genes) ? [{ label: "Normal", gene: "other" }] : a.genes, date_hatch: dateToSupabaseTime(a.date_hatch), last_supper: a.last_supper != null ? dateToSupabaseTime(a.last_supper) : null };
  return supabase.from("ballpythons").insert(d).select("id").single<{ id: string }>();
};

// TODO нужно модиф эту функцию когда добавляются новые категории змей
const httpGetSnakesList = async (list: string[]) => {
  let a = await supabase.from("ballpythons").select().in("id", list);
  return a.data;
};

/* FIXME? нужно ли создать view для этой таблицы?
Это ок если юзер запросил своих змей и видит их айдишники через свой профиль, но если в будущем можно будет заходить на страницы других челов
и запрашивать их змей - то есть риск засветить айдишник юзера? вот что там делать с датой
*/
export function useSnakesList(list: string[], isEnabled: boolean) {
  return useQuery<any, ISupabaseErr, IResSnakesList[]>({
    queryKey: ["bp_list", list],
    queryFn: () => httpGetSnakesList(list),
    enabled: isEnabled,
  });
}

export const httpTransferSnake = async (username: string, snekId: string) =>
  supabase.rpc("transfer_snake", {
    trg_user: username,
    trg_snake: snekId,
  });

export function useTransferSnake() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, any>({
    mutationFn: ({ username, snekId }) => httpTransferSnake(username, snekId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
        refetchType: "all",
      });
    },
  });
}
