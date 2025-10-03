import { IGenesComp } from "../common";

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
  upd: Partial<IReqCreateBPBreed>;
  id: string;
};

export interface IMorphOddsReq {
  p1: string[];
  p2: string[];
}

export type IMMTrait = {
  id: number;
  key: string;
  class_label: "dom-codom" | "het-rec" | "pos-rec" | "pos-other";
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
  genes: IGenesComp[];
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
  male_genes: IGenesComp[][];
  female_genes: IGenesComp[];
  finalised_ids: string[] | null;
}

export interface IUpdClutchReq extends Partial<Omit<IReqCreateBpClutch, "males_ids" | "female_id" | "owner_id">> {
  clutch_babies?: IHatchling[];
}

export interface IReqUpdBpClutch {
  upd: IUpdClutchReq;
  id: string;
}
