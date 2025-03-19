export const enum ESupabase {
  snakepics = "snakepics",
  bpgenes = "bpgenes",
  ballpythons = "ballpythons",
  profiles = "profiles",
  three_cols_profiles = "three_cols_profiles",
}

export const enum EQuKeys {
  PROFILE = "profile",
  COMP_BP = "pb_genes",
  LIST_BP = "bp_list",
}

export interface IGenesBpComp {
  label: string;
  gene: "inc-dom" | "dom" | "rec" | "poly" | "other";
}

export interface ISupabaseErr {
  message: string;
  code?: string;
  statusCode: string;
  details: string | null;
  hint?: string | null;
}

export interface IReqCreateBP {
  snake_name: string;
  sex: string;
  genes: IGenesBpComp[];
  weight: number | null;
  date_hatch: string;
  origin: string;
  parents: []; // TODO ?????
  price: number | null;
  last_supper: string | null;
  feeding: string | null;
  feed_weight: number | null;
  picture: string | null;
  last_action?: "create" | "transfer" | "update" | "delete";
}

export interface IResSnakesList extends IReqCreateBP {
  id: string;
  owner_name: string;
  status: string;
}

export interface IResProfile {
  id: string;
  usermail: string;
  createdat: string;
  username: string;
  role: "free" | "premium";
  regius_list: string[] | null;
}
