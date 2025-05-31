/* eslint-disable no-param-reassign */
import * as yup from "yup";
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
};
const incor = "Отметьте линьку/срыг/отказ, либо укажите массу питомца";
export const schema = yup.object().shape(
  {
    feed_last_at: yup.string().nullable().required("Дата обязательна"),
    feed_ko: yup.string().nullable(),
    feed_comment: yup.string().max(150, "Ограничение 150 символов").nullable(),
    weight: yup.number().when(["refuse", "regurgitation", "shed"], ([refuse, regurgitation, shed], self) => {
      return !shed && !refuse && !regurgitation ? self.transform((v) => (!v || Number.isNaN(v) ? null : v)).required(incor) : self.transform((v) => (!v || Number.isNaN(v) ? null : v)).nullable();
    }),
    feed_weight: yup
      .number()
      .transform((v) => (!v || Number.isNaN(v) ? null : v))
      .nullable(),
    shed: yup.boolean().when(["weight"], ([weight], self) => {
      return !weight ? self.required(incor) : self.nullable();
    }),
    refuse: yup.boolean().when(["weight"], ([weight], self) => {
      return !weight ? self.required(incor) : self.nullable();
    }),
    regurgitation: yup.boolean().when(["weight"], ([weight], self) => {
      return !weight ? self.required(incor) : self.nullable();
    }),
  },
  [
    ["weight", "shed"],
    ["weight", "refuse"],
    ["weight", "regurgitation"],
  ],
);

export const prepareForSubmit = (fd) => {
  let time = dateToSupabaseTime(fd.feed_last_at);

  let feed = fd.feed_weight || fd.refuse || fd.regurgitation ? { ...fd, feed_last_at: time } : null;
  let mass = fd.weight
    ? {
        date: time,
        weight: fd.weight,
      }
    : null;
  let shed = fd.shed ? time : null;
  delete feed.weight;
  delete feed.shed;

  return { feed, mass, shed };
};
