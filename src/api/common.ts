import { UseQueryResult } from "@tanstack/react-query";

export const enum ECategories {
  BP = "ball-pythons",
  BC = "boa-constrictors",
}

// названия таблиц
export const enum ESupabase {
  BP = "ballpythons",
  BP_BREED = "bp_breeding",
  BP_CL = "bp_clutch",
  BP_G = "bpgenes",
  BC_G = "boagenes",
  PROF = "profiles",
  BC = "boa_constrictors",
  REM = "feed_reminders",
  // views
  BP_BREED_V = "user_breeding_view",
  BP_CL_V = "clutch_view",
  PROF_V = "three_cols_profiles",
  REM_V = "feed_reminders_view",
  // storage
  BP_PICS = "bp-pics",
  BC_PICS = "bc-pics",
}

export const categoryToGenesTable = {
  [ECategories.BP]: ESupabase.BP_G,
  [ECategories.BC]: ESupabase.BC_G,
};

export const categoryToBaseTable = {
  [ECategories.BP]: ESupabase.BP,
  [ECategories.BC]: ESupabase.BC,
};

export const enum EQuKeys {
  BP_TREE = "bp_family_tree",
}

export interface ISupabaseErr {
  message: string;
  code?: string;
  statusCode: string;
  details: string | null;
  hint?: string | null;
}

export interface IReqCreateSnake {
  snake_name: string;
  sex: "male" | "female" | null;
  genes: IGenesComp[];
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
  last_action?: "create" | "transfer" | "update" | "archive";
  from_clutch?: string | null;
  mother_id?: string | null;
  father_id?: string | null;
  status?: "alive" | "archived";
}

export type IUpdReq = {
  upd: Partial<IReqCreateSnake>;
  id: string;
};

export type IFeed = {
  feed_last_at?: string | null;
  feed_weight?: number | null;
  feed_ko?: string | null;
  feed_comment?: string | null;
  refuse?: boolean;
  regurgitation?: boolean;
};

export type IFeedReq = {
  id: string;
  feed: IFeed | null;
  mass: { date: string; weight: number; is_clean?: boolean | null } | null;
  shed: string | null;
};

export interface IResSnakesList extends Pick<IReqCreateSnake, "snake_name" | "sex" | "genes" | "weight" | "date_hatch" | "origin" | "parents" | "price" | "picture" | "notes" | "last_action" | "from_clutch"> {
  id: string;
  owner_name: string;
  status: string;
  feeding?: IFeed[];
  shed: string[] | null;
}

export interface IRemindersRes {
  id: string;
  owner_id: string;
  scheduled_time: string; // "2025-08-05T11:30:51+03:00"
  next_occurrence: string; // "2025-08-05T11:30:51+03:00"
  repeat_interval: number;
  snake: string;
  status: "active" | "paused" | "completed";
  notification_id?: string | null;
  category: ECategories;
}

export interface IRemResExt extends IRemindersRes {
  sex: string;
  snake_name: string;
}

export interface IRemindersReq {
  owner_id: string;
  scheduled_time: string; // "2025-08-05T11:30:51+03:00"
  repeat_interval: number;
  snake: string;
  status?: "paused" | "completed";
}

export type TSnakeQueue = UseQueryResult<IResSnakesList[], ISupabaseErr>;

export interface IGenesComp {
  id: number;
  label: string;
  gene: "inc-dom" | "dom" | "rec" | "poly" | "other";
  hasSuper: boolean;
  alias?: string | null;
  hasHet: boolean;
  isPos?: boolean;
}

export type ITransferReq = {
  userId: string;
  snekId: string;
};
