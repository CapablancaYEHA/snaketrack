import * as yup from "yup";
import { dateToSupabaseTime } from "@/utils/time";

export const defVals = {
  weight: null,
  feed_last_at: null,
  feed_ko: null,
  feed_weight: null,
  feed_comment: null,
};

export const schema = yup.object().shape({
  weight: yup.number().nullable(),
  feed_last_at: yup.string().nullable().required("Обязательное поле"),
  feed_weight: yup.number().nullable(),
  feed_ko: yup.string().nullable(),
  feed_comment: yup.string().nullable(),
});

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
