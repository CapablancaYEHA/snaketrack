import * as yup from "yup";
import { IResBpClutch, IUpdClutchReq } from "@/api/models";

type Schema = {
  file: File;
};

export const clutchSchema = yup.object<Schema>().shape({
  picture: yup
    .mixed<File>()
    .test("fileSize", "Вес фото более 3Мb", (v) => (!v ? true : v.size <= 3145728))
    .nullable(),
  date_laid: yup.string().required("Дата кладки обязательна"),
  eggs: yup.number().required("Требуется цифра"),
  slugs: yup.number().required("Требуется цифра"),
  infertile_eggs: yup.number().optional(),
  id: yup.string().notRequired(),
  pics: yup.array().of(yup.string().nullable()).optional().nullable(),
  ids: yup.array().of(yup.string()).notRequired(),
  female_genes: yup.array().of(yup.mixed()).notRequired(),
  male_genes: yup.array().of(yup.mixed()).notRequired(),
});

export type IClutchScheme = yup.InferType<typeof clutchSchema>;

export const makeDefaultClutch = (data?: IResBpClutch | null) => {
  if (!data) return undefined;
  return {
    date_laid: new Date(data.date_laid),
    eggs: data.eggs,
    slugs: data.slugs,
    infertile_eggs: data.infertile_eggs,
    pics: [data.female_picture].concat(data.male_pictures),
    ids: [data.female_id].concat(data.males_ids),
    female_genes: data.female_genes,
    male_genes: data.male_genes,
  };
};

export const prepForUpdate = (sub, dirtyObject, clutch_id): IUpdClutchReq => {
  let upd: any = {};

  for (let k in sub) {
    if (dirtyObject[k]) {
      upd[k] = sub[k];
    }
  }

  console.log("upd", upd);

  return {
    upd,
    id: clutch_id,
  };
};
