import * as yup from "yup";

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
