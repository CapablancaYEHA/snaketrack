import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/client_supabase";
import { ESupabase, ISupabaseErr } from "../common";
import { IReqChangeName, IResProfile } from "./models";

export async function logout() {
  localStorage.removeItem("USER");
  await supabase.auth.signOut({ scope: "local" });
}

const updUsername = async (name: string, id: string) => supabase.from(ESupabase.PROF).update({ username: name }).eq("id", id).throwOnError();

export function useUpdName() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, IReqChangeName>({
    mutationFn: ({ name, id }) => updUsername(name, id),
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: [ESupabase.PROF],
      }),
  });
}

const httpGetProfile = async (a: string) => {
  const { data, error } = await supabase.from(ESupabase.PROF).select("*").eq("id", a).limit(1).single();
  if (error) {
    throw error;
  }
  return data;
};

export function useProfile(id, isEnabled = false) {
  return useQuery<IResProfile, ISupabaseErr>({
    queryKey: [ESupabase.PROF, id],
    queryFn: async () => httpGetProfile(id),
    enabled: isEnabled,
  });
}

const httpGetUsersBySubstring = async (a: string) => {
  const { data, error } = await supabase.from(ESupabase.PROF_V).select("username,createdat,id").ilike("username", `%${a}%`);
  if (error) {
    throw error;
  }
  return data;
};

type IBreederSuggest = Pick<IResProfile, "createdat" | "username" | "id">;

export function useUserSuggestion(str: string) {
  return useQuery<IBreederSuggest[] | null, ISupabaseErr>({
    queryKey: [ESupabase.PROF_V, str],
    queryFn: async () => httpGetUsersBySubstring(str),
    enabled: str?.length > 1,
  });
}
