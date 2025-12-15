import { UseQueryResult } from "@tanstack/react-query";

export enum ECategories {
  BP = "ball-pythons",
  BC = "boa-constrictors",
  CS = "corn-snakes",
}

// названия таблиц не могут содержать дефисы!!!
export const enum ESupabase {
  // base
  BP = "ballpythons",
  BC = "boa_constrictors",
  CS = "corn_snakes",
  REM = "feed_reminders",
  PROF = "profiles",
  MRKT = "market",
  // views
  PROF_V = "three_cols_profiles",
  REM_V = "feed_reminders_view",
  MRKT_V = "market_view",
  // genes
  BP_G = "bpgenes",
  BC_G = "boagenes",
  CS_G = "corngenes",
  // storage
  BP_PICS = "bp-pics",
  BC_PICS = "bc-pics",
  CS_PICS = "cs-pics",
}

export enum ESupaBreed {
  BP_BREED = "bp_breeding",
  BP_CL = "bp_clutch",
  BC_BREED = "bc_breeding",
  BC_CL = "bc_clutch",
  CS_BREED = "cs_breeding",
  CS_CL = "cs_clutch",
  // view
  BP_BREED_V = "user_breeding_view",
  BP_CL_V = "clutch_view",
  BC_BREED_V = "bc_breeding_view",
  BC_CL_V = "bc_clutch_view",
  CS_BREED_V = "cs_breeding_view",
  CS_CL_V = "cs_clutch_view",
}

export const categoryToGenesTable = {
  [ECategories.BP]: ESupabase.BP_G,
  [ECategories.BC]: ESupabase.BC_G,
  [ECategories.CS]: ESupabase.CS_G,
};

export const categoryToBaseTable = {
  [ECategories.BP]: ESupabase.BP,
  [ECategories.BC]: ESupabase.BC,
  [ECategories.CS]: ESupabase.CS,
};

// FIXME
export const categoryToShort = {
  [ECategories.BP]: "bp",
  [ECategories.BC]: "bc",
  [ECategories.CS]: "cs",
};

export const categoryToBucket = {
  [ECategories.BP]: ESupabase.BP_PICS,
  [ECategories.BC]: ESupabase.BC_PICS,
  [ECategories.CS]: ESupabase.CS_PICS,
};

export const categoryToMmCat = {
  [ECategories.BP]: "bps",
  [ECategories.BC]: "bcs",
  [ECategories.CS]: "corns",
};

export const categoryToTransferFunc = {
  [ECategories.BP]: "transfer_snake",
  [ECategories.BC]: "transfer_boa_constrictor",
  [ECategories.CS]: "transfer_corn_snake",
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

export type ISnakeStatuses = "collection" | "isolation" | "on_sale" | "sold" | "reserved" | "deceased" | "archived";

export interface IReqCreateSnake {
  snake_name: string;
  sex: "male" | "female" | null;
  genes: IGenesComp[];
  weight: { date: string; weight: number }[] | null;
  date_hatch: string;
  shadow_date_hatch?: string; // неизменяемая дата рождения, используется для определения siblings в дереве
  origin: string;
  price: number | null;
  feed_last_at?: string | null;
  feed_weight?: string | null;
  feed_ko?: string | null;
  feed_comment?: string;
  feeding?: IFeed[] | null;
  picture: string | null;
  shed?: string[] | null;
  notes: string | null;
  last_action?: "create" | "transfer" | "update" | "archive";
  from_clutch?: string | null;
  mother_id?: string | null;
  father_id?: string | null;
  status?: ISnakeStatuses;
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

export type IFeedReq = Omit<IUpdReq, "feeding" | "weight" | "shed"> & {
  upd: {
    feeding: IFeed[] | null;
    weight: { date: string; weight: number; is_clean?: boolean | null } | null;
    shed: string | null;
    last_action: "create" | "transfer" | "update" | "archive";
  };
  id: string;
};

export interface IResSnakesList extends Pick<IReqCreateSnake, "snake_name" | "sex" | "genes" | "weight" | "date_hatch" | "origin" | "price" | "picture" | "notes" | "last_action" | "from_clutch"> {
  id: string;
  owner_name: string;
  status: string;
  feeding: IFeed[] | null;
  shed?: string[] | null;
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
  gene: "inc-dom" | "dom" | "rec" | "poly" | "other" | "combo";
  hasSuper: boolean;
  alias?: string | null;
  hasHet: boolean;
  isPos?: boolean;
}

export type ITransferReq = {
  userId: string;
  snekId: string;
};

export interface ICreateSaleReq {
  sale_price: number;
  pictures: string[];
  description: string;
  city_code: string;
  city_name?: string | null;
  snake_id: string;
  category: ECategories;
  status: Extract<ISnakeStatuses, "on_sale" | "sold" | "reserved">;
  contacts_group?: string | null;
  contacts_telegram?: string | null;
  // TODO расширить до других стран, соответственно потом в city_code будет падать их вариация кладр
  country: string;
  // TODO поле о дате поднятии объявления
}

export interface IMarketRes extends ICreateSaleReq {
  id: string;
  date_hatch: string;
  sex: "male" | "female" | null;
  genes: IGenesComp[];
  owner_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
  username: string;
  user_createdat: string;
  contacts_group: string | null;
  contacts_telegram: string | null;
}

export interface IEditSale extends Partial<ICreateSaleReq> {
  updated_at?: string;
  completed_at?: string;
}

export type IEditSaleReq = {
  upd: IEditSale;
  id: string;
};

export type IDadataSearch = {
  data: {
    city: string;
    city_with_type: string;
    country: string;
    region: string;
    region_with_type: string;
    city_kladr_id: string;
  };
  unrestricted_value: string;
  value: string;
};

export interface IFamilyTreeRes {
  children: { id: string }[];
  gender: "female" | "male";
  genes: IGenesComp[];
  id: string;
  owner_id: string;
  parents: { id: string }[];
  picture: string;
  siblings: { id: string }[];
  snake_name: string;
  spouses: { id: string }[];
}
