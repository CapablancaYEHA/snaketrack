import { IGenesBpComp } from "../components/genetics/const";

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
}

export interface IResSnakesList extends IReqCreateBP {
  id: string;
  owner_name: string;
  status: string;
}
