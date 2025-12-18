import { HALF_SIZE, NODES_IN_COUPLE, SIZE } from "../constants";
import { Connector, Family, FamilyType, Unit } from "../types";
import { inAscOrder, withId } from "../utils";
import { withType } from "../utils/family";
import { getUnitX, nodeCount } from "../utils/units";

const calcConnectors = (family: Family, families: readonly Family[]) => (connectors: Connector[], unit: Unit) => {
  const pX = getUnitX(family, unit) + HALF_SIZE;
  const pY = family.Y + HALF_SIZE;

  if (nodeCount(unit) === NODES_IN_COUPLE) {
    connectors.push([pX, pY, pX + SIZE, pY]);
  } else if (nodeCount(unit) === 1 && unit.nodes[0]!.spouses.length) {
    families
      .filter((item) => item.id !== family.id)
      .forEach((other) => {
        other.parents.forEach((parent) => {
          if (parent.nodes.some(withId(unit.nodes[0]!.spouses[0]!.id))) {
            const xX = [pX, getUnitX(other, parent) + HALF_SIZE].sort(inAscOrder);
            connectors.push([xX[0]!, pY, xX[1]!, pY]);
          }
        });
      });
  }

  return connectors;
};

export const middle = (families: readonly Family[]): readonly Connector[] => {
  const rootFamilies = families.filter(withType(FamilyType.root));

  return rootFamilies.reduce<Connector[]>((connectors, family) => connectors.concat(family.parents.reduce(calcConnectors(family, rootFamilies), [])), []);
};
