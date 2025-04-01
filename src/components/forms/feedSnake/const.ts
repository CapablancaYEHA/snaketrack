import * as yup from "yup";
import { dateToSupabaseTime } from "@/utils/time";

export const defVals = {
  weight: null,
  feed_last_at: null,
  feed_ko: null,
  feed_weight: null,
  feed_comment: null,
};
const incor = "Нужно указать либо массу питомца, либо массу КО";
export const schema = yup.object().shape(
  {
    feed_last_at: yup.string().nullable().required("Обязательное поле"),
    feed_ko: yup.string().nullable(),
    feed_comment: yup.string().nullable(),
    weight: yup.number().when("feed_weight", ([feed_weight], self) => {
      return feed_weight == null ? self.required(incor) : self.transform((v) => (!v || Number.isNaN(v) ? undefined : v)).nullable();
    }),
    feed_weight: yup.number().when("weight", ([weight], self) => {
      return weight == null ? self.required(incor) : self.nullable();
    }),
  },
  [["feed_weight", "weight"]],
);

export const prepareForSubmit = (fd) => {
  let time = dateToSupabaseTime(fd.feed_last_at);

  let mass = {
    date: time,
    weight: fd.weight,
  };
  // eslint-disable-next-line no-param-reassign
  delete fd.weight;

  return { feed: fd, mass };
};
