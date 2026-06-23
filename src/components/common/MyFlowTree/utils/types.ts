import { type Node } from "@xyflow/react";
import { ECategories, IGenesComp } from "@/api/common";

export interface PersonData extends Record<string, unknown> {
  id: string;
}

export type PersonNodeType = Node<PersonData, "person">;

export interface PseudoNodeData extends Record<string, unknown> {
  id: string;
  width?: number;
  height?: number;
}

export type PseudoNodeType = Node<PseudoNodeData, "pseudo">;

export interface IFlow {
  targetId: string;
  onSelect: (id: string) => void;
  selected: boolean;
  userId?: string | null;
  category: ECategories;
  rawTree?: any;
}
export interface IFamilyNode extends IFlow {
  data: {
    width?: any;
    height?: any;
    id: string;
    owner_id: string;
    snake_name: string;
    gender: string;
    picture: string;
    genes: IGenesComp[];
  };
}
