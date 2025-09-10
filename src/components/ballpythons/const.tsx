import { uniq } from "lodash-es";
import { IResBpBreedingList } from "@/api/ballpythons/models";
import { calcProjGenes } from "../common/utils";

export const calcBreedTraits = (all: IResBpBreedingList[] | undefined) => {
  if (!all) return [];
  let res = all.map((a) => a.female_genes.concat(a.male_genes.flat())).flat();
  let resmore = calcProjGenes(res).map((a) => a.label);
  return uniq(resmore, "label");
};
