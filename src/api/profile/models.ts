export interface IResProfile {
  id: string;
  usermail: string;
  createdat: string;
  username: string;
  role: "free" | "premium";
}

export type IReqChangeName = {
  name: string;
  id: string;
};
