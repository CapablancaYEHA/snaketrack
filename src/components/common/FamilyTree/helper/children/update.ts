/* eslint-disable no-param-reassign */
import { SIZE } from "../constants";
import type Store from "../store";
import type { Family, Unit } from "../types";
import { heightOf } from "../utils/family";
import { getUnitX } from "../utils/units";

export const updateFamilyFunc =
  (store: Store) =>
  (family: Family, parentUnit: Unit): void => {
    const parentFamily = store.getFamily(parentUnit.fid);

    family.pid = parentFamily.id;
    family.Y = parentFamily.Y + heightOf(parentFamily) - SIZE;
    family.X = getUnitX(parentFamily, parentUnit);
  };
