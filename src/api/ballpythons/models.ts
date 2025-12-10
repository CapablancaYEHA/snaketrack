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

export type IMMOff = {
  probability: {
    numerator: number;
    denominator: number;
  };
  traits: IMMTrait[];
  traits_count: number;
  morph_name: string;
  morph_link: null;
};
export interface IMorphOddsRes {
  offspring: IMMOff[];
}
