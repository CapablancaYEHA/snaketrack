import { isEmpty } from "lodash-es";
import { createParser } from "nuqs";

export function chaining(sort, single, multi) {
  if (!isEmpty(single)) {
    const f = Object.entries(single);
    f.forEach(([k, v]) => {
      // @ts-ignore
      const [func, arg] = v.split("-");
      // @ts-ignore
      this[func](k, arg);
    });
  }
  if (!isEmpty(multi)) {
    const f = Object.entries(multi);
    f.forEach(([k, v]) => {
      // @ts-ignore
      const [func, arg] = v.split("-");
      if (func.split("_")?.length > 1) {
        const [outer, inner] = func.split("_");
        // @ts-ignore
        this[outer](k, inner, `(${arg})`);
      } else {
        // @ts-ignore
        func === "contains" ? this[func](k, JSON.stringify(arg.split(",")?.map((g) => ({ label: g })))) : this[func](k, arg.split(","));
      }
    });
  }

  if (sort != null) {
    const [c, d] = sort.split(":");
    // @ts-ignore
    this.order(c, { ascending: d === "asc" });
  }
  // @ts-ignore
  return this;
}

const handleSerialize = (str: { [x: string]: string }) =>
  Object.entries(str)
    .map(([k, v]) => `${k}:${v}`)
    .join("");

const handleParse = (query: string) => {
  const [k, rest] = query.split(":");

  return {
    [k]: rest,
  };
};

export const singleParser = createParser({
  parse: handleParse,
  serialize: handleSerialize,
});

export const multiParser = createParser({
  parse: handleParse,
  serialize: handleSerialize,
});

export const handleSingleSel = (arg, k, setter) => setter(arg ? { [k]: `eq-${arg}` } : null);
export const handleMultiIn = (arg, k, setter) => setter(isEmpty(arg) ? null : { [k]: `in-${arg}` });
export const handleMultiNotIn = (arg, k, setter) => setter(isEmpty(arg) ? null : { [k]: `not_in-${arg}` });
export const handleMultiContainsJson = (arg, k, setter) => setter(isEmpty(arg) ? null : { [k]: `contains-${arg}` });
