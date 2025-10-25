import { isEmpty } from "lodash-es";
import * as yup from "yup";

export const makeInit = (raw) => {
  return {
    sale_price: undefined,
    pictures: raw.pictures,
    city_code: undefined,
    city_name: undefined,
  };
};

export const makeInitEdit = (raw) => {
  return {
    sale_price: raw.sale_price,
    pictures: raw.pictures,
    description: raw.description,
    city_code: raw.city_code,
    city_name: raw.city_name,
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
  description: yup.string().required("Обязательно к заполнению").min(50, "Что-то осмысленное"),
  city_code: yup.string().required("Обязательно к заполнению"),
  city_name: yup.string().notRequired(),
  status: yup.string().nullable(),
});

export type ISellScheme = yup.InferType<typeof schema>;
