import * as yup from "yup";
import { notif } from "@/utils/notif";

export const sexHardcode = [
  { label: "Самец", value: "male" },
  { label: "Самка", value: "female" },
];

type Schema = {
  file: File;
};

export const schema = yup.object<Schema>().shape({
  snake_name: yup
    .string()
    .trim()
    .matches(/^[a-zA-Zа-яА-Я0-9_-\s]{3,30}$/, "От 3 до 30 символов (разрешены - и _, пробелы)")
    .required(),
  sex: yup.string(),
  genes: yup.array().of(yup.object().shape({ label: yup.string(), gene: yup.string() })),
  weight: yup
    .number()
    .transform((v) => (!v || Number.isNaN(v) ? undefined : v))
    .nullable(),
  date_hatch: yup.string().nullable().required("Хотя бы примерно"),
  origin: yup.string().required(),
  parents: yup.mixed().nullable(),
  price: yup
    .number()
    .transform((v) => (!v || Number.isNaN(v) ? undefined : v))
    .nullable(),
  picture: yup
    .mixed<File>()
    .test("fileSize", "Вес фото более 3Мb", (v) => (!v ? true : v.size <= 3145728))
    .nullable(),
  notes: yup.string().nullable(),
});

export const makeDefault = (raw) => {
  return {
    ...raw,
    date_hatch: new Date(raw.date_hatch),
  };
};

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
