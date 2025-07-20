import { isEmpty } from "lodash-es";
import * as yup from "yup";
import { EClSt, IReqUpdBpClutch, IResBpClutch } from "@/api/models";
import { notif } from "@/utils/notif";
import { dateToSupabaseTime } from "@/utils/time";
import { makeHatchlingPlaceholder } from "../clutchUtils";

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
  { label: "Жив", value: "alive" },
  { label: "Не выжил", value: "deceased" },
];

export const clutchSchema = yup.object<Schema>().shape({
  picture: yup
    .mixed<File>()
    .test("fileSize", "Вес фото более 3Мb", (v) => (!v ? true : v.size <= 3145728))
    .nullable(),
  date_laid: yup.string().required("Дата кладки обязательна"),
  date_hatch: yup.string().optional().nullable(),
  eggs: yup.number().required("Требуется цифра"),
  slugs: yup.number().required("Требуется цифра"),
  infertile_eggs: yup.number().optional(),
  id: yup.string().notRequired(),
  placeholders: yup.array().of(yup.mixed()).optional().nullable(),
  future_animals: yup.array().of(
    yup.object({
      snake_name: yup
        .string()
        .trim()
        .matches(/^[a-zA-Zа-яА-Я0-9_-\s]{3,30}$/, "От 3 до 30 символов (- _ space)")
        .required(),
      sex: yup.string().optional().nullable(),
      date_hatch: yup.string().required("Дата обязательна"),
      status: yup.string(),
      genes: yup.array().of(yup.object().shape({ label: yup.string(), gene: yup.string() })),
    }),
  ),
});

export type IClutchScheme = yup.InferType<typeof clutchSchema>;

export const makeDefaultClutch = (data?: IResBpClutch | null) => {
  if (!data) return undefined as any;
  return {
    date_laid: new Date(data.date_laid),
    date_hatch: data.date_hatch ? new Date(data.date_hatch) : new Date(),
    eggs: data.eggs,
    slugs: data.slugs,
    infertile_eggs: data.infertile_eggs,
    placeholders: new Array((data.eggs || 0) - (data.infertile_eggs || 0)).fill(" "),
    future_animals: data.clutch_babies ?? [],
  };
};

export const prepForUpdate = (sub, dirtyObject, clutch_id): IReqUpdBpClutch => {
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

export const prepForHatch = (sub, dirtyObject, clutch_id): IReqUpdBpClutch => {
  let upd: any = {};

  for (let k in sub) {
    if (dirtyObject[k]) {
      upd[k] = sub[k];
    }
  }

  const hatchDate = dateToSupabaseTime(sub.date_hatch);
  const babies = isEmpty(sub.placeholders) ? null : sub.placeholders.map((_, ind) => makeHatchlingPlaceholder({ id: clutch_id, ind, date: hatchDate }));

  delete upd.placeholders;
  delete upd.future_animals;

  return {
    upd: { ...upd, date_hatch: hatchDate, clutch_babies: babies, status: EClSt.HA },
    id: clutch_id,
  };
};

export const prepForFinal = (sub, clutchId) => {
  const newSnakes = sub.future_animals.filter((a) => a.status !== "deceased").map((b) => ({ ...b, from_clutch: clutchId }));

  return {
    snakes: newSnakes,
    clutchUpd: { upd: { status: EClSt.CL }, id: clutchId },
  };
};
