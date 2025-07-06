import * as yup from "yup";
import { IResBpClutch } from "@/api/models";

type Schema = {
  file: File;
};

export const clutchSchema = yup.object<Schema>().shape({
  picture: yup
    .mixed<File>()
    .test("fileSize", "Вес фото более 3Мb", (v) => (!v ? true : v.size <= 3145728))
    .nullable(),
  date_laid: yup.string().nullable().required("Хотя бы примерно"),
});

export type IClutchScheme = yup.InferType<typeof clutchSchema>;

export const makeDefaultClutch = (raw: IResBpClutch) => {
  return {
    ...raw,
    date_laid: new Date(raw.date_laid),
  };
};
