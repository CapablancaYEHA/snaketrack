export interface IResProfile {
  id: string;
  usermail: string;
  createdat: string;
  username: string;
  is_vivarium_on?: boolean;
  snake_tags?: string[];
  role: "free" | "premium";
}

export interface IUpdProfileReq {
  upd: {
    usermail?: string;
    is_vivarium_on?: boolean;
    snake_tags?: string[] | null;
  };
  id: string;
}

export type IReqChangeName = {
  name: string;
  id: string;
};
