export const enum ESupabase {
  "bp-pics" = "bp-pics",
  bpgenes = "bpgenes",
  ballpythons = "ballpythons",
  bp_breeding = "bp_breeding",
  bp_breeding_joined = "user_breeding_view",
  profiles = "profiles",
  three_cols_profiles = "three_cols_profiles",
}

export const enum EQuKeys {
  PROFILE = "profile",
  COMP_BP = "pb_genes",
  LIST_BP = "bp_list",
  LIST_BP_BREED = "bp_list_breed",
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
  refuse?: boolean;
  regurgitation?: boolean;
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
  breeding_regius_list: string[] | null;
}

enum EEvents {
  "pairing" = "pairing",
  "lock" = "lock",
}
type IEv = {
  [key in EEvents]: string;
};
type IDate = {
  date: string;
};

type IBreedStat = "plan" | "woo" | "lock" | "ovul" | "shed" | "clutch";
export interface IReqCreateBPBreed {
  males_events?: {
    [key: string]: (IEv & IDate)[];
  };
  owner_id: string;
  female_prelay_shed_date?: string; // timestampz
  female_ovulation_date?: string; // timestampz
  female_id: string;
  males_ids: string[];
  notes?: string;
  status?: IBreedStat;
}

export interface IResBpBreedingList {
  id: string;
  breed_status: IBreedStat;
  female_name: string;
  female_picture: string | null;
  female_id: string;
  breed_created_at: string;
  breed_males_ids: string[];
  female_genes: IGenesBpComp[];
  male_genes: IGenesBpComp[][];
  males_events?:
    | {
        [key: string]: (IEv & IDate)[];
      }
    | {};
  male_names: string[];
  male_pictures: (string | null)[];
  female_prelay_shed_date?: string;
  female_ovulation_date?: string;
  clutch_id?: string | null; // uuid кладки, если проект завершился ей
}

export interface IResBpBreedDelete {
  status: number; //204
  statusText: string;
}

export interface IMorphOddsReq {
  p1: string[];
  p2: string[];
}

export type IMMTrait = {
  id: number;
  key: string;
  class_label: "dom-codom" | "het-rec" | "pos-rec";
  name: string;
};

export interface IMorphOddsRes {
  offspring: {
    probability: {
      numerator: number;
      denominator: number;
    };
    traits: IMMTrait[];
    traits_count: number;
    morph_name: string;
    morph_link: null;
  }[];
}
