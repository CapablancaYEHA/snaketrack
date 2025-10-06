import { supabase } from "@/lib/client_supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dateToSupabaseTime } from "@/utils/time";
import { ESupabase, IReqCreateSnake, ISupabaseErr } from "../common";
import { httpCreateBpBreed, httpGetSingleBpBreed, httpUpdateBpBreed } from "./breed";
import { IReqCreateBPBreed, IReqCreateBpClutch, IReqUpdBpClutch, IUpdBreedReq } from "./models";

const httpCreateBpClutch = async (a: IReqCreateBpClutch) => {
  return await supabase.from(ESupabase.BP_CL).insert(a).select("id").single<{ id: string }>().throwOnError();
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

export function useMakeBpClutchFromBreed() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, ISupabaseErr, IUpdBreedReq | IReqCreateBPBreed>({
    mutationFn: (a) => makeClutchFromBpBreed(a),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ESupabase.BP_BREED_V],
      });
    },
  });
}

const httpUpdateBpClutch = async (a: IReqUpdBpClutch) => {
  return await supabase.from(ESupabase.BP_CL).update(a.upd).eq("id", a.id).throwOnError();
};

interface IFinaliseClutchReq {
  snakes: IReqCreateSnake[];
  clutchUpd: IReqUpdBpClutch;
}
type IFinaliseClutchRes = {
  id: string;
}[];
const httpFinaliseClutch = async (args: IFinaliseClutchReq): Promise<IFinaliseClutchRes> => {
  const { data, error: insertError } = await supabase.from(ESupabase.BP).insert(args.snakes).select("id").throwOnError();
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
        queryKey: [ESupabase.BP_CL_V, id, ESupabase.BP],
        exact: true,
      });
    },
  });
}
