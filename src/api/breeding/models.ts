import { IGenesComp, IReqCreateSnake, ISnakeStatuses } from "../common";

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
export interface IReqCreateBreed {
  males_events?: {
    [key: string]: (IEv & IDate)[];
  };
  owner_id?: string;
  female_prelay_shed_date?: string; // timestampz
  female_ovulation_date?: string; // timestampz
  female_id: string;
  males_ids: string[];
  notes?: string;
  status?: IBreedStat;
  clutch_id?: string;
}

export interface IResBreedingList {
  id: string;
  breed_status: IBreedStat;
  female_name: string;
  female_picture: string | null;
  female_id: string;
  breed_created_at: string;
  breed_males_ids: string[];
  female_genes: IGenesComp[];
  male_genes: IGenesComp[][];
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

export type IUpdBreedReq = {
  upd: Partial<IReqCreateBreed>;
  id: string;
};

export interface IReqCreateClutch {
  males_ids: string[];
  female_id: string;
  date_laid: string;
  owner_id?: string;
  date_hatch?: string;
  eggs?: number;
  slugs?: number;
  infertile_eggs?: number;
  status?: EClSt;
  picture?: string;
  notes?: string;
}

export interface IHatchling {
  id?: string;
  snake_name: string;
  date_hatch: string;
  sex: "male" | "female" | null;
  genes: IGenesComp[];
  status: Extract<ISnakeStatuses, "collection" | "deceased">;
}

export enum EClSt {
  LA = "laid",
  HA = "hatched",
  CL = "closed",
}
export interface IResClutch {
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
  male_genes: IGenesComp[][];
  female_genes: IGenesComp[];
  finalised_ids: string[] | null;
  notes: string | null;
}

export interface ICreateClutchReq extends Partial<Pick<IReqCreateClutch, "males_ids" | "female_id" | "date_laid" | "eggs" | "slugs" | "infertile_eggs" | "status" | "notes">> {}

export interface IUpdClutchReq extends Partial<Omit<IReqCreateClutch, "males_ids" | "female_id" | "owner_id">> {
  clutch_babies?: IHatchling[];
}

export interface IReqUpdClutch {
  upd: IUpdClutchReq;
  id: string;
}

export interface IFinaliseClutchReq {
  snakes: IReqCreateSnake[];
  clutchUpd: IReqUpdClutch;
}
export type IFinaliseClutchRes = {
  id: string;
}[];

export const ICatShort = ["bp", "bc", "cs"] as const;
