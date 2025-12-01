import * as yup from "yup";

export const defVals = {
  parent: "mother",
  source: "collection",
  mother_id: null,
  father_id: null,
};

export const parentsSchema = yup.object().shape({
  mother_id: yup
    .string()
    .test("mother", "Не заполнена материнская линия", (v) => v != null && v !== "")
    .nullable(),
  father_id: yup
    .string()
    .test("father", "Не заполнена отцовская линия", (v) => v != null && v !== "")
    .nullable(),
  parent: yup.string(),
  source: yup.string(),
});

export type IParentsSchema = yup.InferType<typeof parentsSchema>;
