import { useCallback } from "preact/hooks";
import { supabase } from "@/lib/client_supabase";
import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash-es";
import { upgAlias } from "@/components/common/genetics/const";
import { categToConfig } from "@/components/common/utils";
import { toDataUrl } from "@/utils/supabaseImg";
import { queryClient as instance } from "../lib/client_query";
import { finaliseClutch, makeClutchFromBreed } from "./breeding/breeding";
import { IFinaliseClutchReq, IFinaliseClutchRes, IReqCreateBreed, IUpdBreedReq } from "./breeding/models";
import { ECategories, EQuKeys, ESupaBreed, ESupabase, IDadataSearch, IGenesComp, ISupabaseErr, ITransferReq, categoryToBaseTable, categoryToGenesTable, categoryToShort, categoryToTransferFunc } from "./common";

interface IQueryConfig {
  t: ESupabase;
  s?: string;
  f: (query: any) => any;
  id?: any;
  o?: any;
}

interface IModif<T> extends Pick<IQueryConfig, "t" | "s"> {
  p: T;
  bulk?: boolean;
}

export const supaGet = async <T>(config: IQueryConfig): Promise<T> => {
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
    ...config?.o,
  });
}

const PAGE_SIZE = 20;

export const supaInfiniteGet = async (pageParam, config: IQueryConfig) => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const query = supabase.from(config.t).select(config?.s || "*");

  const { data, error } = await config.f(query).range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    nextPage: data?.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
};

interface IInfinRes<T> {
  pages: { data: T }[];
}

export function useSupaInfiniteGet<T>(config: IQueryConfig, isEnabled: boolean) {
  const queKeys = [config.t, config.id].filter((a) => !isEmpty(a));
  return useInfiniteQuery<any, ISupabaseErr, IInfinRes<T>>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: queKeys,
    queryFn: ({ pageParam }) => supaInfiniteGet(pageParam, config),
    initialPageParam: 0,
    enabled: isEnabled,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    ...config?.o,
  });
}

export const supaCreate = async <T>({ t, p, bulk }: IModif<T>) => {
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

export const supaUpd = async <T>({ t, p }: IModif<T>) => {
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

export const invalidateBpTree = (id: string) => instance.invalidateQueries({ queryKey: [EQuKeys.BP_TREE, id], exact: true });

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

export function useBase64(url?: string | string[] | null, flag?: boolean) {
  // const res = await Promise.all(url.map((p) => toDataUrl(p)));
  return useQuery<any, ISupabaseErr, string>({
    queryKey: ["base64", url],
    queryFn: Array.isArray(url) ? () => Promise.all(url.map((p) => toDataUrl(p))) : () => toDataUrl(url),
    enabled: flag,
  });
}

const httpGetSnakeGenes = async (cat: ECategories) => {
  const { data, error } = await supabase.from(categoryToGenesTable[cat]).select("*").throwOnError();
  if (error) {
    throw error;
  }
  return upgAlias(data);
};

export function useSnakeGenes(cat: ECategories, isEnabled = true) {
  return useQuery<IGenesComp[], ISupabaseErr>({
    queryKey: [categoryToGenesTable[cat], cat],
    queryFn: () => httpGetSnakeGenes(cat),
    enabled: isEnabled,
    staleTime: 60000 * 60 * 4, // 4 часа
  });
}

const httpTransferSnake = async (userId: string, snekId: string, category) => {
  const { data, error } = await supabase.rpc(categoryToTransferFunc[category], {
    trg_user: userId,
    trg_snake: snekId,
    action: "transfer",
  });
  if (error) {
    throw error;
  }
  return data;
};

export function useTransferSnake(cat: ECategories) {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, ITransferReq>({
    mutationFn: ({ userId, snekId }) => httpTransferSnake(userId, snekId, cat),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [categoryToBaseTable[cat]],
      });
    },
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
        language: "RU",
        from_bound: {
          value: "city",
        },
        to_bound: {
          value: "city",
        },
        locations: [
          {
            country: "Россия",
          },
        ],
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
  return useMutation<IDadataSearch[], { message?: string }, string>({
    mutationFn: (a) => httpDadata(a),
  });
}

// Breeding
export function useMakeClutchFromBreed(category: ECategories) {
  const cat = categoryToShort[category];
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, ISupabaseErr, IUpdBreedReq | IReqCreateBreed>({
    mutationFn: (a) => makeClutchFromBreed(category, a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ESupaBreed[`${cat.toUpperCase()}_BREED_V`]],
      });
    },
  });
}

export function useFinaliseClutch(category: ECategories, id: string) {
  const cat = categoryToShort[category];
  const queryClient = useQueryClient();
  return useMutation<IFinaliseClutchRes, ISupabaseErr, IFinaliseClutchReq>({
    mutationFn: (a) => finaliseClutch(category, a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ESupaBreed[`${cat.toUpperCase()}_CL_V`], id, categoryToBaseTable[category]],
        exact: true,
      });
    },
  });
}
