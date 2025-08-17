import { IGenesBpComp, IMMTrait } from "@api/models";
import { sortBy } from "lodash-es";
import { notif } from "@/utils/notif";

export const geneToColor = {
  dom: "#6e2585",
  "inc-dom": "#0085c3",
  rec: "#b7295a",
  poly: "#009bbb",
  other: "#737373",
};

export const redef = {
  position: "relative",
  "--pill-radius": "6px",
  color: "#efefef",
  width: "fit-content",
};

export const upgAlias = (arr: IGenesBpComp[]) =>
  arr.reduce((tot, cur) => {
    // eslint-disable-next-line no-param-reassign
    if (cur.alias != null) {
      let al = { ...cur, label: `${cur.alias}`, alias: `${cur.label}` };
      return tot.concat(cur).concat(al);
    }
    return tot.concat(cur);
  }, [] as IGenesBpComp[]);

export const upgradeOptions = (arr: IGenesBpComp[], search: string) => {
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
    }, [] as IGenesBpComp[])
    .filter((item) => {
      return item.label.toLowerCase().includes(inp) || item.alias?.toLowerCase().includes(inp);
    });
};

const fullHet = ["50% Het", "66% Het", "Het"];
const reHet = /(?<=het\s)[\w\s]+/i;
const re50het = /(?<=50het\s)[\w\s]+/i;
const re66het = /(?<=66het\s)[\w\s]+/i;
const reArr = [reHet, re50het, re66het];

export const checkGeneConflict = (current: IGenesBpComp[], val: IGenesBpComp) => {
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
    for (let i of reArr) {
      if (!i.test(val.label)) {
        continue;
      }
      let trg = val.label.match(i);
      if (current.some((a) => a.label === trg?.[0] || a.alias === trg?.[0])) {
        notifSameHet();
        if (current.some((a) => a.label.includes(val.label) || a.alias?.includes(val.label))) {
          notifHetAlias();
          return current;
        }
        return current;
      }
    }
  }
  return [...current, val];
};

const notifHomo = () =>
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

const notifHetAlias = () =>
  notif({
    c: "red",
    t: "Конфликт генов",
    m: "Уже есть гетерозигота",
  });

const notifSameHet = () =>
  notif({
    c: "red",
    t: "Конфликт генов",
    m: "Уже выбран визуал, невозможно добавить Het",
  });

const priority = {
  het: 2,
  "66%": 3,
  "50%": 4,
};

export const sortBpGenes = (arr: IGenesBpComp[] | null): IGenesBpComp[] => {
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

export const fromMMtoPill = (m: IMMTrait): IGenesBpComp => {
  const gene = m.class_label.includes("rec") ? "rec" : "inc-dom";
  const label = m.name;
  const hasHet = !m.class_label.includes("vis-rec");

  return {
    id: m.id,
    label,
    gene,
    hasSuper: false,
    hasHet,
  };
};
