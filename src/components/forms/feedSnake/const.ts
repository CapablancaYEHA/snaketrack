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
};
const incor = "Укажите линьку, массу питомца, либо массу КО";
export const schema = yup.object().shape(
  {
    feed_last_at: yup.string().nullable().required("Дата обязательна"),
    feed_ko: yup.string().nullable(),
    feed_comment: yup.string().max(150, "Ограничение 150 символов").nullable(),
    weight: yup.number().when(["feed_weight", "shed"], ([feed_weight, shed], self) => {
      return feed_weight == null && !shed ? self.transform((v) => (!v || Number.isNaN(v) ? null : v)).required(incor) : self.transform((v) => (!v || Number.isNaN(v) ? null : v)).nullable();
    }),
    feed_weight: yup.number().when(["weight", "shed"], ([weight, shed], self) => {
      return weight == null && !shed ? self.transform((v) => (!v || Number.isNaN(v) ? null : v)).required(incor) : self.transform((v) => (!v || Number.isNaN(v) ? null : v)).nullable();
    }),
    shed: yup.boolean().when(["weight", "feed_weight"], ([weight, feed_weight], self) => {
      return weight == null || feed_weight == null ? self.required(incor) : self.nullable();
    }),
  },
  [
    ["feed_weight", "weight"],
    ["shed", "weight"],
    ["shed", "feed_weight"],
  ],
);

export const prepareForSubmit = (fd) => {
  let time = dateToSupabaseTime(fd.feed_last_at);

  let feed = fd.feed_weight ? { ...fd, feed_last_at: time } : null;
  let mass = fd.weight
    ? {
        date: time,
        weight: fd.weight,
      }
    : null;
  let shed = fd.shed ? time : null;
  delete fd.weight;
  delete fd.shed;

  return { feed, mass, shed };
};
