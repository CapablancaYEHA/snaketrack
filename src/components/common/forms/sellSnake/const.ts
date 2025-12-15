import { isEmpty } from "lodash-es";
import * as yup from "yup";

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

export const schema = yup.object<Schema>().shape({
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
});

export type ISellScheme = yup.InferType<typeof schema>;
