import { isEmpty } from "lodash-es";
import * as yup from "yup";
import { EClSt, ICreateClutchReq, IReqUpdClutch, IResClutch } from "@/api/breeding/models";
import { notif } from "@/utils/notif";
import { dateToSupabaseTime } from "@/utils/time";
import { makeHatchlingPlaceholder } from "./clutchUtils";

type Schema = {
  file: File;
};

export const stdErr = (e: any) =>
  notif({
    c: "red",
    t: "Ошибка",
    m: e.message,
    code: e.code || e.statusCode,
  });

export const statusHardcode = [
  { label: "ОК", value: "collection" },
  { label: "Не выжил", value: "deceased" },
];

export const initClutchAddValues = {
  female_id: undefined,
  males_ids: [],
  date_laid: undefined,
  date_hatch: undefined,
  eggs: undefined,
  slugs: undefined,
  infertile_eggs: null,
  notes: null,
};

const baseClutchSchema = yup.object<Schema>().shape({
  date_laid: yup.string().required("Дата кладки обязательна"),
  date_hatch: yup.string().optional().nullable(),
  eggs: yup.number().required("Требуется число"),
  slugs: yup.number().required("Требуется число"),
  infertile_eggs: yup.number().optional().notRequired(),
  id: yup.string().notRequired(),
  placeholders: yup.array().of(yup.mixed()).optional().nullable(),
  notes: yup.string().nullable(),
  future_animals: yup.array().of(
    yup.object({
      snake_name: yup
        .string()
        .trim()
        .matches(/^[a-zA-Zа-яА-Я0-9_\-,.\s]{3,60}$/, "От 3 до 60 символов и -|_|,|.|пробел")
        .required(),
      sex: yup.string().optional().nullable(),
      date_hatch: yup.string().required("Дата обязательна"),
      status: yup.string(),
      genes: yup.array().of(yup.object().shape({ label: yup.string(), gene: yup.string() })),
    }),
  ),
});

export const clutchEditSchema = baseClutchSchema.shape({
  father_id: yup.string().required("Самец обязателен в кладке"),
  mother_id: yup.string(),
});

export const clutchAddSchema = baseClutchSchema.shape({
  female_id: yup.string().required("Самка обязательна в кладке"),
  males_ids: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string(),
        snake: yup.string().required("Самец обязателен в кладке"),
      }),
    )
    .required("Поле обязательно")
    .min(1, "Количество самцов не может быть 0"),
});

export type IClutchEditScheme = yup.InferType<typeof clutchEditSchema>;
export type IClutchAddScheme = yup.InferType<typeof clutchAddSchema>;

export const makeInitClutch = (data?: IResClutch | null) => {
  if (!data) return undefined as any;
  return {
    date_laid: new Date(data.date_laid),
    date_hatch: data.date_hatch ? new Date(data.date_hatch) : new Date(),
    eggs: data.eggs,
    slugs: data.slugs,
    infertile_eggs: data.infertile_eggs,
    notes: data.notes,
    placeholders: new Array((data.eggs || 0) - (data.infertile_eggs || 0)).fill(" "),
    future_animals: data.clutch_babies ?? [],
    father_id: data.males_ids.length > 1 ? null : data.males_ids?.[0],
    mother_id: data.female_id,
  };
};

export const prepForClutchUpdate = (sub, dirtyObject, clutch_id): IReqUpdClutch => {
  let upd: any = {};

  for (let k in sub) {
    if (dirtyObject[k]) {
      upd[k] = sub[k];
    }
  }

  delete upd.placeholders;
  delete upd.future_animals;
  delete upd.date_hatch;

  return {
    upd: { ...upd, date_laid: upd.date_laid ? dateToSupabaseTime(upd.date_laid) : undefined },
    id: clutch_id,
  };
};

export const prepForClutchCreate = (sbm): ICreateClutchReq => {
  return { males_ids: sbm.males_ids.map((a) => a.snake), female_id: sbm.female_id, date_laid: dateToSupabaseTime(sbm.date_laid), eggs: sbm.eggs, slugs: sbm.slugs, infertile_eggs: sbm.infertile_eggs };
};

export const prepForHatch = (sub, dirtyObject, clutch_id): IReqUpdClutch => {
  let upd: any = {};

  for (let k in sub) {
    if (dirtyObject[k]) {
      upd[k] = sub[k];
    }
  }

  const hatchDate = sub.date_hatch ? dateToSupabaseTime(sub.date_hatch) : undefined;
  const laidDate = sub.date_laid ? dateToSupabaseTime(sub.date_laid) : undefined;
  const babies = isEmpty(sub.placeholders) ? null : sub.placeholders.map((_, ind) => makeHatchlingPlaceholder({ id: clutch_id, ind, date: hatchDate }));

  delete upd.placeholders;
  delete upd.future_animals;

  return {
    upd: { ...upd, date_hatch: hatchDate, date_laid: laidDate, clutch_babies: babies, status: EClSt.HA },
    id: clutch_id,
  };
};

export const prepForFinal = (sub, clutchId) => {
  const newSnakes = sub.future_animals
    .filter((a) => a.status !== "deceased")
    .map((b) => ({ ...b, date_hatch: dateToSupabaseTime(b.date_hatch), mother_id: sub.mother_id, father_id: sub.father_id, from_clutch: clutchId, shadow_date_hatch: dateToSupabaseTime(sub.date_hatch) }));

  return {
    snakes: newSnakes,
    clutchUpd: { upd: { status: EClSt.CL }, id: clutchId },
  };
};
