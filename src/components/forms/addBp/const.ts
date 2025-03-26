import * as yup from "yup";
import { notif } from "../../../utils/notif";

export const sexHardcode = [
  { label: "Самец", value: "male" },
  { label: "Самка", value: "female" },
];

export const feederHardcode = [
  { label: "❄️Мышь голая", value: "ft_mouse_pinkie" },
  { label: "❄️Мышь опушенок", value: "ft_mouse_fuzzy" },
  { label: "❄️Мышь бегунок", value: "ft_mouse_runner" },
  { label: "❄️Мышь взрослая", value: "ft_mouse_adult" },
  { label: "❄️Крыса голая", value: "ft_rat_pinkie" },
  { label: "❄️Крыса опушенок", value: "ft_rat_fuzzy" },
  { label: "❄️Крыса бегунок", value: "ft_rat_runner" },
  { label: "❄️Крыса подросток", value: "ft_rat_teen" },
  { label: "❄️Крыса взрослая", value: "ft_rat_adult" },
  { label: "🐁Мышь голая живая", value: "live_mouse_pinkie" },
  { label: "🐁Мышь опушенок живая", value: "live_mouse_fuzzy" },
  { label: "🐁Мышь бегунок живая", value: "live_mouse_runner" },
  { label: "🐁Мышь взрослая живая", value: "live_mouse_adult" },
  { label: "🐀Крыса голая живая", value: "live_rat_pinkie" },
  { label: "🐀Крыса опушенок живая", value: "live_rat_fuzzy" },
  { label: "🐀Крыса бегунок живая", value: "live_rat_runner" },
  { label: "🐀Крыса подросток живая", value: "live_rat_teen" },
  { label: "🐀Крыса взрослая живая", value: "live_rat_adult" },
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
  weight: yup.number().nullable(),
  date_hatch: yup.string().nullable().required("Хотя бы примерно"),
  origin: yup.string().required(),
  parents: yup.mixed().nullable(),
  price: yup.number().nullable(),
  feed_last_at: yup.string().nullable(),
  feed_weight: yup.number().nullable(),
  feed_ko: yup.string().nullable(),
  feed_comment: yup.string().nullable(),
  picture: yup
    .mixed<File>()
    .test("fileSize", "Вес фото более 3Мb", (v) => (!v ? true : v.size <= 3145728))
    .nullable(),
  notes: yup.string().nullable(),
});

export const defVals = {
  snake_name: "",
  sex: "female",
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
