import { supabase } from "@/lib/client_supabase";
import { ESupabase } from "../common";
import { IReqCreateBPBreed, IResBpBreedingList, IUpdBreedReq } from "./models";

export const httpCreateBpBreed = async (a: IReqCreateBPBreed) => {
  return await supabase.from(ESupabase.BP_BREED).insert(a).select("id").single<{ id: string }>().throwOnError();
};

export const httpGetSingleBpBreed = async (id: string): Promise<IResBpBreedingList> => {
  const { data, error } = await supabase.from(ESupabase.BP_BREED_V).select("*").eq("id", id).limit(1).single();
  if (error) {
    throw error;
  }
  return data;
};

export const httpUpdateBpBreed = async (a: IUpdBreedReq) => {
  return await supabase.from(ESupabase.BP_BREED).update(a.upd).eq("id", a.id).throwOnError();
};
