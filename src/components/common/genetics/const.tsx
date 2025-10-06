import { sortBy } from "lodash-es";
import { IMMTrait } from "@/api/ballpythons/models";
import { IGenesComp } from "@/api/common";
import { notif } from "@/utils/notif";

export const geneToColor = {
  dom: "#6e2585",
  "inc-dom": "#0085c3",
  rec: "#b7295a",
  poly: "#009bbb",
  other: "#737373",
  combo: "#b8860b",
  locality: "#7ab800",
};

export const redef = {
  position: "relative",
  "--pill-radius": "6px",
  color: "#efefef",
  width: "fit-content",
};

export const upgAlias = (arr: IGenesComp[]) =>
  arr.reduce((tot, cur) => {
    // eslint-disable-next-line no-param-reassign
    if (cur.alias != null) {
      let al = { ...cur, label: `${cur.alias}`, alias: `${cur.label}` };
      return tot.concat(cur).concat(al);
    }
    return tot.concat(cur);
  }, [] as IGenesComp[]);

export const upgradeOptions = (arr: IGenesComp[], search: string) => {
  if (search.trim().length === 0) return arr;
  let inp = search.trim().toLowerCase();
  return arr
    .reduce((tot, cur) => {
      if (cur.hasHet) {
        if (inp.toLowerCase().includes("he")) {
          let res = fullHet.map((a) => ({ ...cur, label: `${a} ${cur.label}` }));
          return tot.concat(cur).concat(res);
        }
        if (inp.indexOf("6") === 0) {
          return tot.concat(cur).concat({ ...cur, label: `66% Het ${cur.label}` });
        }
        if (inp.indexOf("5") === 0) {
          return tot.concat(cur).concat({ ...cur, label: `50% Het ${cur.label}` });
        }
        return tot.concat(cur);
      }
      if (cur.hasSuper) {
        let a: any = [{ ...cur, label: `Super ${cur.label}` }];
        return tot.concat(cur).concat(a);
      }
      return tot.concat(cur);
    }, [] as IGenesComp[])
    .filter((item) => {
      return item.label.toLowerCase().includes(inp) || item.alias?.toLowerCase().includes(inp);
    });
};

const fullHet = ["50% Het", "66% Het", "Het"];
const reHet = /(?<=het\s)[\w\s]+/i;

export const checkGeneConflict = (current: IGenesComp[], val: IGenesComp) => {
  if (val.hasSuper) {
    if (current.some((x) => x.label === `Super ${val.label}` || val.label === `Super ${x.label}`)) {
      notifExcessSuper();
      return current;
    }
    if (current.some((a) => a.id === val.id)) {
      notifHomo();
      return current;
    }
    return [...current, val];
  }
  if (val.hasHet) {
    if (current.some((a) => a.label.includes(val.label) || a.alias?.includes(val.label))) {
      notifHetAlias();
      return current;
    }
    if (reHet.test(val.label)) {
      let trg = val.label.match(reHet);
      if (current.some((a) => a.label?.includes(trg?.[0] ?? ""))) {
        notifSameHet();
        return current;
      }
      if (current.some((a) => a.alias?.includes(trg?.[0] ?? ""))) {
        notifHetAlias();
        return current;
      }
    }
  }
  return [...current, val];
};

const notifHetAlias = () =>
  notif({
    c: "red",
    t: "Конфликт генов",
    m: "Ген уже добавлен (возможно, под alias-названием)",
  });

const notifExcessSuper = () =>
  notif({
    c: "red",
    t: "Конфликт генов",
    m: "Неверное сочетание с Super-формой",
  });

const notifHomo = () =>
  notif({
    c: "red",
    t: "Конфликт генов",
    m: "Уже есть гетерозигота",
  });

const notifSameHet = () =>
  notif({
    c: "red",
    t: "Конфликт генов",
    m: "Уже добавлен визуал или Het для данного гена",
  });

const priority = {
  het: 2,
  "66%": 3,
  "50%": 4,
};

export const sortSnakeGenes = (arr: IGenesComp[] | null): IGenesComp[] => {
  let kek = (arr ?? []).sort((a, b) => {
    if (a.gene !== b.gene && a.gene === "rec") {
      return -1;
    }
    if (a.gene === "inc-dom" && b.gene === "dom") {
      return -1;
    }
    if (a.gene === "dom" && b.gene === "inc-dom") {
      return 1;
    }

    return 0;
  });

  return sortBy(kek, [(o) => (o.isPos ? 5 : (priority[o.label.substring(0, 3).toLowerCase()] ?? 0))]);
};

export const emptyMMTrait = { id: 0, label: "Normal", gene: "other", hasSuper: false, hasHet: false, isPos: false };

export const fromMMtoPill = (m: IMMTrait): IGenesComp => {
  const gene = m.class_label.includes("rec") ? "rec" : m.class_label.includes("other") ? "other" : "inc-dom";
  const label = m.name.startsWith("Pos") ? m.name.split("Pos ")[1] : m.name;
  const hasHet = m.class_label === "het-rec" || m.class_label === "dom-codom";
  const isPos = m.class_label.includes("pos-other");

  return {
    id: m.id,
    label,
    gene,
    hasSuper: false,
    hasHet,
    isPos,
  };
};
