import { useCallback } from "preact/hooks";
import { supabase } from "@/lib/client_supabase";
import { useQueries } from "@tanstack/react-query";
import { ESupabase } from "../common";
import { supaGet } from "../hooks";
import { bcSingle } from "./configs";

// TODO удалить здесь и в ДБ, после поднятия версии и когда пройдет норм время
export const httpUpdBcFeeding = async (id, feed, mass, shed) => {
  const { data, error } = await supabase.rpc("append_feeding_boa_constrictor", {
    trg_snake: id,
    feeding_obj: feed,
    weight_obj: mass,
    new_shed: shed,
    action: "update",
  });
  if (error) {
    throw error;
  }
  return data;
};

export function useBcQueue(snakes: (string | undefined)[]) {
  const memoCombine = useCallback((results) => ({ data: results.map((result) => result.data), isPending: results.some((result) => result.isPending), isError: results.some((result) => result.isError) }), []);
  return useQueries({
    queries: snakes
      ?.filter((el, ind, self) => self.indexOf(el) === ind)
      .map((id) => ({
        queryKey: [ESupabase.BC, "queue", id],
        queryFn: () => supaGet(bcSingle(id)),
        enabled: snakes != null && snakes?.length > 0,
      })),
    combine: memoCombine,
  });
}
