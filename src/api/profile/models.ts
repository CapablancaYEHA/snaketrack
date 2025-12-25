export interface IResProfile {
  id: string;
  usermail: string;
  createdat: string;
  username: string;
  is_vivarium_on?: boolean;
  role: "free" | "premium";
}

export interface IUpdProfileReq {
  upd: {
    usermail?: string;
    is_vivarium_on?: boolean;
  };
  id: string;
}

export type IReqChangeName = {
  name: string;
  id: string;
};
