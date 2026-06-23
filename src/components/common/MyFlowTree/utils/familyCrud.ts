import { IFamilyTreeRes } from "@/api/common";
import { PersonNodeType, PseudoNodeType } from "./types";

export const WIDTH = 196;
export const HEIGHT = 260;
export const magic_number = 780;
export const edgeColor = "var(--mantine-color-yellow-8)";

export const prepareNodes = (dt: IFamilyTreeRes) => {
  const pers: any[] = [];

  dt.persons.forEach((p, ind) => {
    pers.push({
      id: p.id,
      data: {
        gender: p.sex,
        genes: p.genes,
        id: p.id,
        owner_id: p.owner_id,
        picture: p.picture,
        snake_name: p.snake_name,
      },
    });
  });

  return {
    persons: pers,
    couples: dt.couples,
  };
};

const position = { x: 0, y: 0 };

export const prepareFinal = (data) => {
  const personNodes: PersonNodeType[] = data.persons.map((p: any) => {
    return {
      id: p.id,
      type: "person",
      data: {
        ...p.data,
        width: WIDTH,
        height: HEIGHT,
      },
      position,
    };
  });

  const pseudoNodes: PseudoNodeType[] = data.couples.map((c: any) => ({
    id: `pseudo-${c.id}`,
    type: "pseudo",
    data: { id: c.id },
    position,
  }));

  const edges: any[] = [];

  data.couples.forEach((couple: any) => {
    const pseudoId = `pseudo-${couple.id}`;
    // parents -> pseudo
    couple.partners.forEach((parentId: string) => {
      edges.push({
        id: `${parentId}-${pseudoId}`,
        source: parentId,
        target: pseudoId,
      });
    });
    // pseudo -> children
    couple.children.forEach((childId: string) => {
      edges.push({
        id: `${pseudoId}-${childId}`,
        source: pseudoId,
        target: childId,
      });
    });
  });

  return {
    nodes: [...personNodes, ...pseudoNodes],
    edges,
  };
};
