export const feederCond = [
  { label: "❄️ заморозка", value: "ft" },
  { label: "☀️ живой", value: "live" },
];

export const feederType = [
  { label: "🐁 Мышь", value: "mouse" },
  { label: "🐀 Крыса", value: "rat" },
  { label: "🦛 Мастомис", value: "mast" },
  { label: "🐿️ Хомяк", value: "hams" },
  { label: "🐤 Цыпленок", value: "chick" },
  { label: "🦃 Перепел", value: "quail" },
];

export const feederAge = [
  { label: "голыш", value: "pinkie" },
  { label: "бархатная", value: "velvet" },
  { label: "опушенок", value: "fuzzy" },
  { label: "бегунок", value: "runner" },
  { label: "подросток", value: "teen" },
  { label: "взрослый", value: "adult" },
];

const feederDictionary = [...feederCond, ...feederType, ...feederAge].reduce((tot, cur) => ({ ...tot, [cur.value]: cur.label }), {});

export const assembleFeeder = ({ cond, type, age }) => `${cond ? `${cond}_` : ""}${type ?? ""}${age ? `_${age}` : ""}`;

export const codeToFeeder = (a: string) => {
  if (!a) return "";
  return a
    .split("_")
    .map((i) => feederDictionary[i])
    .join(" ");
};
