import { supabase } from "@/lib/client_supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { upgAlias } from "@/components/common/genetics/const";
import { toDataUrl } from "@/utils/supabaseImg";
import { httpUpdBpFeeding } from "./ballpythons/snake";
import { httpUpdBcFeeding } from "./boa-constrictors/snake";
import { ECategories, ESupabase, IFeedReq, IGenesComp, ISupabaseErr } from "./common";

interface IQueryConfig {
  t: ESupabase;
  s?: string;
  f: (query: any) => any;
  id?: string | number;
}

interface IModif<T> extends Pick<IQueryConfig, "t"> {
  p: T;
}

export const supaGet = async (config: IQueryConfig) => {
  const query = supabase.from(config.t).select(config?.s || "*");

  const { data, error } = await config.f(query);

  if (error) {
    throw error;
  }
  return data;
};

export function useSupaGet<T>(config: IQueryConfig, isEnabled: boolean) {
  return useQuery<any, ISupabaseErr, T>({
    queryKey: [...Object.values(config)],
    queryFn: () => supaGet(config),
    enabled: isEnabled,
  });
}

const supaCreate = async <T>({ t, p }: IModif<T>) => {
  return await supabase.from(t).insert(p).select("id").single<{ id: string }>().throwOnError();
};

export function useSupaCreate<T>(table: ESupabase, inval?: ESupabase) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, T>({
    mutationFn: (a) => supaCreate({ t: table, p: a }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [inval ?? table],
      });
    },
  });
}

const supaUpd = async <T>({ t, p }: IModif<T>) => {
  const { upd, id } = p as any;
  return await supabase.from(t).update(upd).eq("id", id).throwOnError();
};

type IInval = {
  qk: (string | ESupabase)[];
  e?: boolean;
};

export function useSupaUpd<T>(table: ESupabase, invalWhat?: IInval) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, T>({
    mutationFn: (a) => supaUpd({ t: table, p: a }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        ...(invalWhat
          ? {
              queryKey: [invalWhat.qk],
              exact: invalWhat.e,
            }
          : { queryKey: [table] }),
      });
    },
  });
}

// TODO Нужно написать триггеры на удаление из массивов в Breeding и Clutch - ИЛИ ЖЕ
//В Клатч сделана ошибка, что впринципе не можешь удалить змею из активной кладки или плана. У меня при удалении получается еще и триггер надо запускать чтобы вычистить из массивов
// Может тогда вместо удаления, сделать возможность только перевести в Архив (аналогично статусу "Умер") ? Это значит что змее никаким образом нельзя апдейтить содержимое профиля
// + её больше нельзя выбрать в планах и кладках, но в уже созданных она останется
// А вот если змею кому-то перевели, то все равно проблемка остается

const supaDel = async <T>({ t, p }: IModif<T>) => {
  const { id } = p as any;
  return await supabase.from(t).delete().eq("id", id).throwOnError();
};

export function useSupaDel(table: ESupabase, inval?: ESupabase) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, { id: string }>({
    mutationFn: (a) => supaDel({ t: table, p: a }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [inval ?? table],
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

export function useUpdSnakeFeeding(category: ECategories) {
  const func = category === ECategories.BP ? httpUpdBpFeeding : httpUpdBcFeeding;
  const table = category === ECategories.BP ? ESupabase.BP : ESupabase.BC;
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IFeedReq>({
    mutationFn: ({ id, feed, mass, shed }) => func(id, feed, mass, shed),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [table],
      });
    },
  });
}

const categoryToTable = {
  [ECategories.BP]: ESupabase.BP_G,
  [ECategories.BC]: ESupabase.BC_G,
};

const httpGetSnakeGenes = async (cat: ECategories) => {
  const { data, error } = await supabase.from(categoryToTable[cat]).select("*").throwOnError();
  if (error) {
    throw error;
  }
  return upgAlias(data);
};

export function useSnakeGenes(cat: ECategories) {
  return useQuery<IGenesComp[], ISupabaseErr>({
    queryKey: [categoryToTable[cat], cat],
    queryFn: () => httpGetSnakeGenes(cat),
    enabled: true,
    staleTime: 60000 * 60 * 4, // 4 часа
  });
}
