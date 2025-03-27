import * as yup from "yup";

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
