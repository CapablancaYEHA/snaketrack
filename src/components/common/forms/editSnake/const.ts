import * as yup from "yup";

type Schema = {
  file: File;
};

export const schema = yup.object<Schema>().shape({
  snake_name: yup
    .string()
    .trim()
    .matches(/^[a-zA-Zа-яА-Я0-9_\-,.\s]{3,60}$/, "От 3 до 60 символов и -|_|,|.|пробел")
    .required(),
  sex: yup.string().nullable(),
  genes: yup.array().of(yup.object().shape({ label: yup.string(), gene: yup.string() })),
  date_hatch: yup.string().nullable().required("Хотя бы примерно"),
  origin: yup.string().required(),
  price: yup
    .number()
    .transform((v) => (!v || Number.isNaN(v) ? undefined : v))
    .nullable(),
  picture: yup
    .mixed<File>()
    .test("fileSize", "Вес сжатого фото более 1Мb", (v) => (!v ? true : v.size <= 1048576))
    .nullable(),
  notes: yup.string().nullable(),
  status: yup.string().nullable(),
});

export const makeDefault = (raw) => {
  return {
    ...raw,
    date_hatch: new Date(raw.date_hatch),
  };
};
