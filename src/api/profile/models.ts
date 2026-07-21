export interface IResProfile {
  id: string;
  usermail: string;
  createdat: string;
  username: string;
  is_vivarium_on?: boolean;
  snake_tags?: string[];
  role: "free" | "premium";
  contacts_group?: string;
  contacts_telegram?: string;
  contacts_website?: string;
  contacts_city_code?: string;
  contacts_city_name?: string;
}

export interface IUpdProfileReq {
  upd: {
    usermail?: string;
    is_vivarium_on?: boolean;
    snake_tags?: string[] | null;
    contacts_group?: string;
    contacts_telegram?: string;
    contacts_website?: string;
    contacts_city_code?: string;
    contacts_city_name?: string;
  };
  id: string;
}

export type IReqChangeName = {
  name: string;
  id: string;
};
