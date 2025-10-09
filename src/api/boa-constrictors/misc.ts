import { supabase } from "@/lib/client_supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ESupabase, ISupabaseErr, ITransferReq } from "../common";

// Transfer
const httpTransferBc = async (userId: string, snekId: string) => {
  const { data, error } = await supabase.rpc("transfer_boa_constrictor", {
    trg_user: userId,
    trg_snake: snekId,
    action: "transfer",
  });
  if (error) {
    throw error;
  }
  return data;
};
