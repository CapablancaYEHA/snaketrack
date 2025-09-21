import { useCallback } from "preact/hooks";
import { supabase } from "@/lib/client_supabase";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash-es";
import { upgAlias } from "@/components/common/genetics/const";
import { categToConfig } from "@/components/common/utils";
import { toDataUrl } from "@/utils/supabaseImg";
import { httpUpdBpFeeding } from "./ballpythons/snake";
import { httpUpdBcFeeding } from "./boa-constrictors/snake";
import { ECategories, ESupabase, IFeedReq, IGenesComp, ISupabaseErr, categoryToBaseTable, categoryToGenesTable } from "./common";

interface IQueryConfig {
  t: ESupabase;
  s?: string;
  f: (query: any) => any;
  id?: any;
}

interface IModif<T> extends Pick<IQueryConfig, "t" | "s"> {
  p: T;
  bulk?: boolean;
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
  const queKeys = [config.t, config.id].filter((a) => !isEmpty(a));
  return useQuery<any, ISupabaseErr, T>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: queKeys,
    queryFn: () => supaGet(config),
    enabled: isEnabled,
  });
}

const supaCreate = async <T>({ t, p, bulk }: IModif<T>) => {
  //   return await supabase.from(t).insert(p).select("id").single<{ id: string }>().throwOnError();

  const query = supabase.from(t).insert(p);
  let res;

  if (bulk) {
    res = await query.throwOnError();
  } else {
    res = await query.select("id").single<{ id: string }>().throwOnError();
  }
  return res;
};

type IInval = {
  qk: (string | ESupabase)[];
  e?: boolean;
};

export function useSupaCreate<T>(table: ESupabase, invalWhat?: IInval, isBulk?: boolean) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, T>({
    mutationFn: (a) => supaCreate({ t: table, p: a, bulk: isBulk }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        ...(invalWhat
          ? {
              queryKey: invalWhat.qk,
              exact: invalWhat.e,
            }
          : { queryKey: [table] }),
      });
    },
  });
}

const supaUpd = async <T>({ t, p }: IModif<T>) => {
  const { upd, id } = p as any;
  return await supabase.from(t).update(upd).eq("id", id).throwOnError();
};

export function useSupaUpd<T>(table: ESupabase, invalWhat?: IInval) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, T>({
    mutationFn: (a) => supaUpd({ t: table, p: a }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        ...(invalWhat
          ? {
              queryKey: invalWhat.qk,
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

export function useSupaDel(table: ESupabase, invalWhat?: IInval) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, { id: string }>({
    mutationFn: (a) => supaDel({ t: table, p: a }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        ...(invalWhat
          ? {
              queryKey: invalWhat.qk,
              exact: invalWhat.e,
            }
          : { queryKey: [table] }),
      });
    },
  });
}

export function useSnakeQueue(snakes: (string | undefined)[], categ: ECategories) {
  const memoCombine = useCallback((results) => ({ data: results.map((result) => result.data), isPending: results.some((result) => result.isPending), isError: results.some((result) => result.isError) }), []);
  return useQueries({
    queries: snakes
      ?.filter((el, ind, self) => self.indexOf(el) === ind)
      .map((id) => ({
        queryKey: [categoryToBaseTable[categ], "queue", id],
        queryFn: () => supaGet(categToConfig[categ](id)),
        enabled: snakes != null && snakes?.length > 0,
      })),
    combine: memoCombine,
  });
}

export function useBase64(url: string, flag: boolean) {
  return useQuery<any, ISupabaseErr, string>({
    queryKey: ["base64", url],
    queryFn: () => toDataUrl(url),
    enabled: flag,
  });
}

export function useUpdSnakeFeeding(category: ECategories, invalWhat?: IInval) {
  const func = category === ECategories.BP ? httpUpdBpFeeding : httpUpdBcFeeding;
  const table = category === ECategories.BP ? ESupabase.BP : ESupabase.BC;
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IFeedReq>({
    mutationFn: ({ id, feed, mass, shed }) => func(id, feed, mass, shed),
    onSuccess: () => {
      queryClient.invalidateQueries({
        ...(invalWhat
          ? {
              queryKey: invalWhat.qk,
              exact: invalWhat.e,
            }
          : { queryKey: [table] }),
      });
    },
  });
}

const httpGetSnakeGenes = async (cat: ECategories) => {
  const { data, error } = await supabase.from(categoryToGenesTable[cat]).select("*").throwOnError();
  if (error) {
    throw error;
  }
  return upgAlias(data);
};

export function useSnakeGenes(cat: ECategories) {
  return useQuery<IGenesComp[], ISupabaseErr>({
    queryKey: [categoryToGenesTable[cat], cat],
    queryFn: () => httpGetSnakeGenes(cat),
    enabled: true,
    staleTime: 60000 * 60 * 4, // 4 часа
  });
}
