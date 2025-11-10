/* eslint-disable no-param-reassign */
import { SIZE } from "../constants";
import type Store from "../store";
import type { Family, Unit } from "../types";
import { getUnitX } from "../utils/units";

export const updateFamilyFunc =
  (store: Store) =>
  (family: Family, childUnit: Unit): void => {
    const childFamily = store.getFamily(childUnit.fid);

    family.cid = childFamily.id;
    family.Y = childFamily.Y - SIZE;
    family.X = getUnitX(childFamily, childUnit);
  };
