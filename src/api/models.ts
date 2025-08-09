export const enum ESupabase {
  ballpythons = "ballpythons",
  bp_breeding = "bp_breeding",
  bp_clutch = "bp_clutch",
  bpgenes = "bpgenes",
  profiles = "profiles",
  "bp-pics" = "bp-pics",
  "reminders" = "feeding_reminders",
  // views
  bp_breeding_joined = "user_breeding_view",
  bp_clutch_joined = "clutch_view",
  three_cols_profiles = "three_cols_profiles",
}

export const enum EQuKeys {
  PROFILE = "profile",
  COMP_BP = "pb_genes",
  LIST_BP = "bp_list",
  LIST_BP_BREED = "bp_list_breed",
  LIST_BP_CLUTCH = "bp_list_clutch",
  BP_TREE = "bp_family_tree",
  REMIND = "reminders",
}

export interface IGenesBpComp {
  id?: number;
  label: string;
  gene: "inc-dom" | "dom" | "rec" | "poly" | "other";
  hasSuper: boolean;
  alias?: string | null;
  hasHet: boolean;
  isPos?: boolean;
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
  sex: "male" | "female" | null;
  genes: IGenesBpComp[];
  weight: { date: string; weight: number }[] | null;
  date_hatch: string;
  shadow_date_hatch?: string; // неизменяемая дата рождения, используется для определения siblings в дереве
  origin: string;
  parents?: { female: string; males: string[] }; // TODO ?????
  price: number | null;
  feed_last_at?: string | null;
  feed_weight?: string | null;
  feed_ko?: string | null;
  feed_comment?: string;
  picture: string | null;
  notes: string | null;
  last_action?: "create" | "transfer" | "update" | "delete";
  from_clutch?: string | null;
  mother_id?: string | null;
  father_id?: string | null;
}

export type IFeed = {
  feed_last_at?: string | null;
  feed_weight?: number | null;
  feed_ko?: string | null;
  feed_comment?: string;
  refuse?: boolean;
  regurgitation?: boolean;
};

export interface IResSnakesList extends Pick<IReqCreateBP, "snake_name" | "sex" | "genes" | "weight" | "date_hatch" | "origin" | "parents" | "price" | "picture" | "notes" | "last_action" | "from_clutch"> {
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

export enum EBreedStat {
  PLAN = "plan",
  WOO = "woo",
  LOCK = "lock",
  OVUL = "ovul",
  SHED = "shed",
  CLUTCH = "clutch",
}
export type IBreedStat = `${EBreedStat}`;
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
  clutch_id?: string;
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

export interface IReqCreateBpClutch {
  males_ids: string[];
  female_id: string;
  date_laid: string;
  owner_id: string;
  date_hatch?: string;
  eggs?: number;
  slugs?: number;
  infertile_eggs?: number;
  status?: EClSt;
  picture?: string;
}

export interface IHatchling {
  id?: string;
  snake_name: string;
  date_hatch: string;
  sex: "male" | "female" | null;
  genes: IGenesBpComp[];
  status: "alive" | "deceased";
}

export enum EClSt {
  LA = "laid",
  HA = "hatched",
  CL = "closed",
}
export interface IResBpClutch {
  id: string;
  owner_id: string;
  males_ids: string[];
  female_id: string;
  date_laid: string;
  date_hatch: string | null;
  eggs: number | null;
  slugs: number | null;
  infertile_eggs: number | null;
  status: EClSt;
  picture: string | null;
  clutch_babies: IHatchling[] | null;
  female_picture: string | null;
  male_pictures: string | null;
  male_genes: IGenesBpComp[][];
  female_genes: IGenesBpComp[];
  finalised_ids: string[] | null;
}

export interface IUpdClutchReq extends Partial<Omit<IReqCreateBpClutch, "males_ids" | "female_id" | "owner_id">> {
  clutch_babies?: IHatchling[];
}

export interface IReqUpdBpClutch {
  upd: IUpdClutchReq;
  id: string;
}

export interface IRemindersRes {
  id: string;
  owner_id: string;
  scheduled_time: string; // "2025-08-05T11:30:51+03:00"
  next_occurrence: string; // "2025-08-05T11:30:51+03:00"
  repeat_interval: number;
  snake_ids: string[] | null;
  status: "active" | "paused" | "completed";
  notification_id: string | null;
}

export interface IRemindersReq {
  owner_id: string;
  scheduled_time: string; // "2025-08-05T11:30:51+03:00"
  repeat_interval: number;
  snake_ids: string[];
  status?: "paused" | "completed";
  notification_id?: string;
}
