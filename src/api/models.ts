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
  id: number;
  label: string;
  gene: "inc-dom" | "dom" | "rec" | "poly" | "other";
  hasSuper: boolean;
  alias?: string | null;
  hasHet: boolean;
  possible?: boolean;
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
  weight: { date: string; weight: number }[] | null;
  date_hatch: string;
  origin: string;
  parents: []; // TODO ?????
  price: number | null;
  feed_last_at?: string | null;
  feed_weight?: string | null;
  feed_ko?: string | null;
  feed_comment?: string;
  picture: string | null;
  notes: string | null;
  last_action?: "create" | "transfer" | "update" | "delete";
}

export type IFeed = {
  feed_last_at?: string | null;
  feed_weight?: number | null;
  feed_ko?: string | null;
  feed_comment?: string;
};

export interface IResSnakesList extends Pick<IReqCreateBP, "snake_name" | "sex" | "genes" | "weight" | "date_hatch" | "origin" | "parents" | "price" | "picture" | "notes" | "last_action"> {
  id: string;
  owner_name: string;
  status: string;
  feeding?: IFeed[];
  shed: string[] | null;
}

export interface IResProfile {
  id: string;
  usermail: string;
  createdat: string;
  username: string;
  role: "free" | "premium";
  regius_list: string[] | null;
}
