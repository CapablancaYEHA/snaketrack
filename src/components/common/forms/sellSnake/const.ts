import { isEmpty } from "lodash-es";
import * as yup from "yup";
import { IGenesComp, IReqCreateSnake } from "@/api/common";
import { dateToSupabaseTime } from "@/utils/time";

export const emptyDefault = {
  sale_price: undefined,
  pictures: undefined,
  city_code: undefined,
  city_name: undefined,
  contacts_group: undefined,
  contacts_messager: undefined,
  sex: null,
  snake_name: "",
  date_hatch: undefined,
  discount_price: undefined,
  discount_until: undefined,
  genes: [],
};

export const makeInit = (raw) => {
  return {
    sale_price: undefined,
    pictures: raw.pictures,
    city_code: undefined,
    city_name: undefined,
    contacts_group: undefined,
    contacts_messager: undefined,
  };
};

export const makeInitEdit = (raw) => {
  return {
    sale_price: raw.sale_price,
    pictures: raw.pictures,
    description: raw.description,
    city_code: raw.city_code,
    city_name: raw.city_name,
    contacts_group: raw.contacts_group,
    contacts_telegram: raw.contacts_messager,
  };
};

type Schema = {
  file: File[];
};

export const schemaBase = yup.object<Schema>().shape({
  sale_price: yup
    .number()
    .transform((v) => (!v || Number.isNaN(v) ? undefined : v))
    .required("Обязательно к заполнению"),
  pictures: yup
    .mixed<File[]>()
    .required("Минимум 1 фото")
    .test("fileSize", "Вес сжатого фото более 1Мb", (v) => !isEmpty(v) && v && v?.every((a) => a.size <= 1048576)),
  description: yup.string().required("Обязательно к заполнению").min(50, "Ожидаем контент объявления от 50 символов"),
  city_code: yup.string().required("Обязательно к заполнению"),
  city_name: yup.string().notRequired(),
  status: yup.string().nullable(),
  contacts_group: yup
    .string()
    .nullable()
    .test("test_group", "Нужна полная ссылка", (v) => (!v ? true : v.startsWith("http"))),
  contacts_telegram: yup
    .string()
    .nullable()
    .test("test_telegram", "Некорректный формат", (v) => (!v ? true : /^@?[a-z\d_]+$/i.test(v))),
  discount_until: yup.string().optional().nullable(),
  discount_price: yup
    .number()
    .transform((v) => (!v || Number.isNaN(v) ? 0 : v))
    .optional(),
});

export type ISellScheme = yup.InferType<typeof schemaBase>;

export const schemaEmpty = schemaBase.shape({
  snake_name: yup
    .string()
    .trim()
    .optional()
    .test((v) => (!v ? true : /^[a-zA-Zа-яА-Я0-9_-\s]{3,30}$/.test(v))),
  sex: yup.string().nullable(),
  genes: yup.array().of(yup.object().shape({ label: yup.string(), gene: yup.string() })),
  date_hatch: yup.string().nullable().required("Хотя бы примерно"),
});

export type ISellEmptyScheme = yup.InferType<typeof schemaEmpty>;

export interface IReqCreateSnakeForAdv extends Omit<IReqCreateSnake, "weight" | "origin" | "price" | "notes"> {}

export const createSnakeFromEmpty = (a): IReqCreateSnakeForAdv => {
  let genes = isEmpty(a.genes) ? [{ label: "Normal", gene: "other" }] : a.genes;

  return {
    picture: null,
    sex: a.sex,
    snake_name: a.snake_name || genes?.map((h) => h.label).join(", "),
    status: "on_sale",
    genes: genes as IGenesComp[],
    date_hatch: dateToSupabaseTime(a.date_hatch),
  };
};
