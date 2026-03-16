import md5 from "crypto-js/md5";
import { isEmpty } from "lodash-es";
import { IGenesComp } from "@/api/common";
import { dateSubtructTime, dateToSupabaseTime, getStartOf } from "@/utils/time";

// return { ...s, [k]: `not-null` };

// FIXME TODO Сейчас функции в БД и на фронте присутствие Normal в генах влияет на вычисление хэша, хотя сами понимаете это неважно если указаны еще гены кроме нормала любые
// Делать это в ДБ впадлу, надо выпустить хотфиск, который автоматически просто удаляет Normal из набора генов, если было введено что-либо еще ?
const prep = (g: IGenesComp[]) => {
  return g
    ?.map((a) => {
      if (a.isPos) return `Pos ${a.label}`;
      return a.label;
    })
    .sort()
    .join(" ")
    .trim();
};

export const calculateHash = (v) => md5(prep(v)).toString();

export const handleHash = (arg, k, setter) =>
  setter((s) => {
    if (isEmpty(arg)) {
      const n = { ...s };
      delete n[k];
      return isEmpty(n) ? null : n;
    }
    const res = calculateHash(arg);
    return { ...s, [k]: `eq-${res}` };
  });

export const handleSingleRange = (arg, k, setter) =>
  setter((s) => {
    if (!arg) {
      const n = { ...s };
      delete n[k];
      return isEmpty(n) ? null : n;
    }
    return { ...s, [k]: `range-${arg}` };
  });

export const handleSingleAge = (arg, k, setter) =>
  setter((s) => {
    if (!arg) {
      const n = { ...s };
      delete n[k];
      return isEmpty(n) ? null : n;
    }
    return { ...s, [k]: arg };
  });

export function chaining(sort, single, multi) {
  if (!isEmpty(single)) {
    const f = Object.entries(single);
    f.forEach(([k, v]) => {
      // @ts-ignore
      const [func, ...arg] = v.split("-");
      if (func === "not") {
        // @ts-ignore
        this[func](k, "is", null);
      } else if (func === "range") {
        const [left, right] = arg.join("-").split(",");
        // @ts-ignore
        this.gte(k, left).lte(k, right);
      } else if (func === "gte" || func === "lte") {
        // @ts-ignore
        this[func](k, dateToSupabaseTime(dateSubtructTime(getStartOf(new Date()), arg)));
      } else {
        // @ts-ignore
        this[func](k, arg.join("-"));
      }
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
