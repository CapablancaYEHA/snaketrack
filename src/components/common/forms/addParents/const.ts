import * as yup from "yup";

export const defVals = {
  source: "collection",
  mother_id: undefined,
  father_id: undefined,
};

export const parentsSchema = yup.object().shape(
  {
    mother_id: yup.string().when(["father_id"], ([father_id], self) => {
      if (father_id) {
        return self.nullable();
      }
      return self.test("mother", "Нужно заполнить хотя бы одного родителя", (v) => v != null && v !== "");
    }),
    father_id: yup.string().when(["mother_id"], ([mother_id], self) => {
      if (mother_id) {
        return self.nullable();
      }
      return self.test("father", "Нужно заполнить хотя бы одного родителя", (v) => v != null && v !== "");
    }),
    parent: yup.string(),
    source: yup.string(),
  },
  [["mother_id", "father_id"]],
);

export type IParentsSchema = yup.InferType<typeof parentsSchema>;
