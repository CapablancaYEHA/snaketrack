import { supabase } from "@/lib/client_supabase";

// TODO удалить здесь и в ДБ, после поднятия версии и когда пройдет норм время
export const httpUpdBpFeeding = async (id, feed, mass, shed) => {
  const { data, error } = await supabase.rpc("append_feeding_ballpython", {
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
