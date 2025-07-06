import { notif } from "@/utils/notif";

export const uplErr = (e: any) =>
  notif({
    c: "red",
    t: "Ошибка загрузки файла",
    m: e.message,
    code: e.code || e.statusCode,
  });

export const filterSubmitByDirty = (subm, dirty) => {
  const res = {};
  for (let key in subm) {
    if (dirty[key]) res[key] = subm[key];
  }
  return res;
};
