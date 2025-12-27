/* eslint-disable no-param-reassign */
import * as yup from "yup";
import { IVivFeeder } from "@/api/common";
import { dateToSupabaseTime } from "@/utils/time";

export const defVals = {
  weight: null,
  feed_last_at: null,
  feed_ko: null,
  feed_weight: null,
  feed_comment: null,
  shed: null,
  refuse: null,
  regurgitation: null,
  isClean: true,
};

const incor = "Укажите новую Массу питомца ИЛИ отметьте линьку / срыг / отказ, ИЛИ информацию о кормлении";

export const calcSchema = (isVivOn?: boolean) =>
  yup.object().shape(
    {
      feed_last_at: yup.string().nullable().required("Дата обязательна"),
      feed_ko: yup.string().when(["weight", "shed", "regurgitation", "refuse"], ([weight, shed, regurgitation, refuse], self) => {
        return isVivOn && !weight && !shed && !regurgitation && !refuse
          ? self.required("Обязательно при отслеживании Вивария").test("checkit", "При конкретизации КО, тип — обязателен, остальное опционально", (val) => {
              if (!val) return true;
              const arr = val.split("_");
              if (val.startsWith("ft") || val.startsWith("live")) {
                return Boolean(arr?.[1]);
              }
              return Boolean(arr?.[0]);
            })
          : self.nullable().test("checkit", "При конкретизации КО, тип — обязателен, остальное опционально", (val) => {
              if (!val) return true;
              const arr = val.split("_");
              if (val.startsWith("ft") || val.startsWith("live")) {
                return Boolean(arr?.[1]);
              }
              return Boolean(arr?.[0]);
            });
      }),
      feed_comment: yup.string().max(250, "Ограничение 250 символов").nullable(),
      weight: yup.number().when(["refuse", "regurgitation", "shed", "feed_ko", "feed_weight"], ([refuse, regurgitation, shed, feed_ko, feed_weight], self) => {
        if (feed_ko || feed_weight) {
          return self.nullable();
        }
        return !shed && !refuse && !regurgitation ? self.transform((v) => (!v || Number.isNaN(v) ? null : v)).required("Заполняется по условиям") : self.optional().nullable();
      }),
      feed_weight: yup.number().when(["weight", "shed", "regurgitation", "refuse"], ([weight, shed, regurgitation, refuse], self) => {
        return isVivOn && !weight && !shed && !regurgitation && !refuse ? self.transform((v) => (!v || Number.isNaN(v) ? null : v)).required("Обязательно при отслеживании Вивария") : self.transform((v) => (!v || Number.isNaN(v) ? null : v)).nullable();
      }),
      shed: yup.boolean().when(["refuse", "regurgitation", "weight", "feed_ko", "feed_weight"], ([refuse, regurgitation, weight, feed_ko, feed_weight], self) => {
        if (feed_ko || feed_weight) {
          return self.nullable();
        }
        return !weight && !refuse && !regurgitation ? self.required(incor) : self.nullable();
      }),
      refuse: yup.boolean().when(["weight", "regurgitation", "shed", "feed_ko", "feed_weight"], ([weight, regurgitation, shed, feed_ko, feed_weight], self) => {
        if (feed_ko || feed_weight) {
          return self.nullable();
        }
        return !weight && !shed && !regurgitation ? self.required(incor) : self.nullable();
      }),
      regurgitation: yup.boolean().when(["refuse", "weight", "shed", "feed_ko", "feed_weight"], ([refuse, weight, shed, feed_ko, feed_weight], self) => {
        if (feed_ko || feed_weight) {
          return self.nullable();
        }
        return !weight && !shed && !refuse ? self.required(incor) : self.nullable();
      }),
      isClean: yup.boolean().optional().nullable(),
    },
    [
      ["weight", "shed"],
      ["weight", "refuse"],
      ["weight", "regurgitation"],
      ["regurgitation", "shed"],
      ["regurgitation", "refuse"],
      ["shed", "refuse"],
      ["weight", "feed_ko"],
      ["weight", "feed_weight"],
      ["regurgitation", "feed_ko"],
      ["regurgitation", "feed_weight"],
      ["refuse", "feed_ko"],
      ["refuse", "feed_weight"],
      ["shed", "feed_ko"],
      ["shed", "feed_weight"],
    ],
  );

export type ISubmitType = yup.InferType<ReturnType<typeof calcSchema>>;

export const prepareForSubmit = (fd: ISubmitType) => {
  let time = dateToSupabaseTime(fd.feed_last_at);

  let feed = fd.feed_weight || fd.refuse || fd.regurgitation || fd.feed_ko ? { ...fd, feed_last_at: time } : null;
  let mass = fd.weight
    ? {
        date: time,
        weight: fd.weight,
        is_clean: fd.isClean,
      }
    : null;
  let shed = fd.shed ? time : null;
  if (feed) {
    delete feed.weight;
    delete feed.shed;
  }

  let viv;
  const splited = fd.feed_ko?.split("_");
  if (splited?.length ?? 0 > 2) {
    viv = splited?.[1];
  }
  const [pre, rest] = splited ?? [];
  viv = [IVivFeeder.MS, IVivFeeder.RAT].includes((pre ?? "") as any) ? splited?.[0] : splited?.[1];

  return { feed, mass, shed, ko_cat: viv };
};
