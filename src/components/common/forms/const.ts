import { uniq } from "lodash-es";
import { IResBreedingList } from "@/api/breeding/models";
import { notif } from "@/utils/notif";
import { calcProjGenes } from "../utils";

export const uplErr = (e: any) =>
  notif({
    c: "red",
    t: "Ошибка загрузки файла",
    m: e.message || "Только jpeg или png",
    code: e.code || e.statusCode,
  });

export const filterSubmitByDirty = (subm, dirty) => {
  const res = {};
  for (let key in subm) {
    if (dirty[key]) res[key] = subm[key];
  }
  return res;
};

export const calcTraitsForFilter = (all: IResBreedingList[] | undefined) => {
  if (!all) return [];
  let res = all.map((a) => a.female_genes.concat(a.male_genes.flat())).flat();
  let resmore = calcProjGenes(res).map((a) => a.label);
  return uniq(resmore, "label");
};
