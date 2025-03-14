export interface IGenesBpComp {
  label: string;
  gene: "inc-dom" | "dom" | "rec" | "poly" | "other";
}

export const geneToColor = {
  dom: "#6e2585",
  "inc-dom": "#0085c3",
  rec: "#b7295a",
  poly: "#009bbb",
  other: "#737373",
};

export const genes: IGenesBpComp[] = [
  {
    label: "Gravel",
    gene: "inc-dom",
  },
  {
    label: "Lesser (Butter)",
    gene: "inc-dom",
  },
  {
    label: "Spider",
    gene: "dom",
  },
  {
    label: "Sunset",
    gene: "rec",
  },
];

export const redef = {
  "--pill-radius": "8px",
  color: "white",
  width: "fit-content",
};
