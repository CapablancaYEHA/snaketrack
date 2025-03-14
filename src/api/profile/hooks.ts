import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient as instance } from "../../lib/client_query";
import { supabase } from "../../lib/client_supabase";
import { ISupabaseErr } from "../models";

export async function logout() {
  localStorage.removeItem("USER");
  await supabase.auth.signOut({ scope: "local" });
}

//TODO Типизровать
const updUsername = async (name: string, id: string) => supabase.from("profiles").update({ username: name }).eq("id", id).throwOnError();

export function useUpdName() {
  const queryClient = useQueryClient();
  return useMutation<any, ISupabaseErr, any>({
    mutationFn: ({ name, id }) => updUsername(name, id),
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: ["profile"],
      }),
  });
}

const httpGetProfile = async (a: string) => {
  let d = await supabase.from("profiles").select("*").eq("id", a).limit(1).single();
  return d.data;
};

export function useProfile(id, isEnabled = false) {
  return useQuery<any, any>({
    queryKey: ["profile", id],
    queryFn: async () => httpGetProfile(id),
    enabled: isEnabled,
  });
}

const httpGetUsersBySubstring = async (a: string) => {
  let d = await supabase.from("three_cols_profiles").select("username,createdat").ilike("username", `%${a}%`);
  return d.data;
};

export function useUserSuggestion(str: string) {
  return useQuery<any, any>({
    queryKey: ["profiles_list", str],
    queryFn: async () => httpGetUsersBySubstring(str),
    enabled: str?.length > 1,
  });
}
