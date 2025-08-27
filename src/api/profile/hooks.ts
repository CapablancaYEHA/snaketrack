import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/client_supabase";
import { EQuKeys, ESupabase, IResProfile, ISupabaseErr } from "../models";

export async function logout() {
  localStorage.removeItem("USER");
  await supabase.auth.signOut({ scope: "local" });
}

const updUsername = async (name: string, id: string) => supabase.from(ESupabase.profiles).update({ username: name }).eq("id", id).throwOnError();

type IReqChangeName = {
  name: string;
  id: string;
};
export function useUpdName() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqChangeName>({
    mutationFn: ({ name, id }) => updUsername(name, id),
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: [EQuKeys.PROFILE],
      }),
  });
}

const httpGetProfile = async (a: string) => {
  const { data, error } = await supabase.from(ESupabase.profiles).select("*").eq("id", a).limit(1).single();
  if (error) {
    throw error;
  }
  return data;
};

export function useProfile(id, isEnabled = false) {
  return useQuery<IResProfile, ISupabaseErr>({
    queryKey: [EQuKeys.PROFILE, id],
    queryFn: async () => httpGetProfile(id),
    enabled: isEnabled,
  });
}

const httpGetUsersBySubstring = async (a: string) => {
  const { data, error } = await supabase.from(ESupabase.three_cols_profiles).select("username,createdat,id").ilike("username", `%${a}%`);
  if (error) {
    throw error;
  }
  return data;
};

type IBreederSuggest = Pick<IResProfile, "createdat" | "username" | "id">;

export function useUserSuggestion(str: string) {
  return useQuery<IBreederSuggest[] | null, ISupabaseErr>({
    queryKey: ["all_profiles", str],
    queryFn: async () => httpGetUsersBySubstring(str),
    enabled: str?.length > 1,
  });
}
