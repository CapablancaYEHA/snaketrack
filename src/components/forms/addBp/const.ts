import { isEmpty } from "lodash-es";
import * as yup from "yup";
import { IReqCreateBP } from "@/api/models";
import { dateToSupabaseTime } from "@/utils/time";
import { notif } from "../../../utils/notif";

type Schema = {
  file: File;
};

export const schema = yup.object<Schema>().shape({
  snake_name: yup
    .string()
    .trim()
    .matches(/^[a-zA-Zа-яА-Я0-9_-\s]{3,30}$/, "От 3 до 30 символов (разрешены - и _, пробелы)")
    .required(),
  sex: yup.string().nullable(),
  genes: yup.array().of(yup.object().shape({ label: yup.string(), gene: yup.string() })),
  weight: yup
    .number()
    .transform((v) => (!v || Number.isNaN(v) ? null : v))
    .nullable()
    .max(5000, "Это региус-рекордсмен?"),

  date_hatch: yup.string().nullable().required("Хотя бы примерно"),
  origin: yup.string().required(),
  parents: yup.mixed().nullable(),
  price: yup.number().nullable(),
  feed_last_at: yup.string().nullable(),
  feed_weight: yup.number().nullable(),
  feed_ko: yup
    .string()
    .nullable()
    .test("checkit", "Тип КО обязателен при заполнении кормления, остальное - опционально", (val) => {
      if (!val) return true;
      const arr = val.split("_");
      if (val.startsWith("ft") || val.startsWith("live")) {
        return Boolean(arr?.[1]);
      }
      return Boolean(arr?.[0]);
    }),
  feed_comment: yup.string().max(150, "Ограничение 150 символов").nullable(),
  picture: yup
    .mixed<File>()
    .test("fileSize", "Вес фото более 3Мb", (v) => (!v ? true : v.size <= 3145728))
    .nullable(),
  notes: yup.string().nullable(),
});

export const defVals = {
  snake_name: "",
  sex: null,
  genes: [],
  weight: null,
  date_hatch: null,
  origin: "purchase",
  parents: null,
  price: null,
  feed_last_at: null,
  feed_ko: null,
  feed_weight: null,
  feed_comment: null,
  picture: null,
  notes: null,
};

export const uplErr = (e: any) =>
  notif({
    c: "red",
    t: "Ошибка загрузки файла",
    m: e.message,
    code: e.code || e.statusCode,
  });

export const prepareForSubmit = (a): Omit<IReqCreateBP, "picture"> => {
  let genes = isEmpty(a.genes) ? [{ label: "Normal", gene: "other" }] : a.genes;
  let l = a.feed_last_at != null ? dateToSupabaseTime(a.feed_last_at) : null;
  let w =
    a.weight == null
      ? null
      : [
          {
            weight: a.weight,
            date: dateToSupabaseTime(new Date()),
          },
        ];
  let d = {
    ...a,
    genes,
    date_hatch: dateToSupabaseTime(a.date_hatch),
    feeding: [
      {
        feed_last_at: l,
        feed_weight: a.feed_weight,
        feed_ko: a.feed_ko,
        feed_comment: a.feed_comment,
      },
    ],
    weight: w,
  };
  delete d.feed_last_at;
  delete d.feed_weight;
  delete d.feed_ko;
  delete d.feed_comment;
  return d;
};
