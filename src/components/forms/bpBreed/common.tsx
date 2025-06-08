/* eslint-disable no-lonely-if */
import { Group } from "@mantine/core";
import { isEmpty } from "lodash-es";
import * as yup from "yup";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { IUpdBreedReq, TSnakeQueue, useSnake as useFemale, useSnakeQueue, useSnakesList } from "@/api/hooks";
import { IReqCreateBPBreed, IResSnakesList } from "@/api/models";

interface IInit {
  owned_bp_list: string[];
  fem: string | null | undefined;
  fetchFields: Record<"id" | "snake", string>[];
}
export function useUtilsBreed({ owned_bp_list, fem, fetchFields }: IInit) {
  const { data: regi, isPending: isListPen } = useSnakesList(owned_bp_list, !isEmpty(owned_bp_list));
  const regFems = regi?.filter((a) => a.sex === "female")?.map((b) => ({ label: b.snake_name, value: b.id }));
  const regMales = regi?.filter((a) => a.sex === "male")?.map((b) => ({ label: b.snake_name, value: b.id }));
  const { data: femData } = useFemale(fem ?? "", fem != null);
  const { data: malesData, isPending } = useSnakeQueue(fetchFields?.filter((a) => a.snake != null)?.map((a) => a.snake)) as TSnakeQueue;

  const isAddAllowed = regMales?.length !== fetchFields?.length;

  return { isListPen, isQuePen: isPending, isAddAllowed, femData, malesData, regFems, regMales };
}

export const breedSchema = yup.object().shape({
  female_id: yup
    .string()
    .test("female", "Самка обязательна для проекта", (v) => v != null && v !== "")
    .nullable(),
  males_ids: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string(),
        snake: yup.string().required("Самец обязателен для проекта"),
      }),
    )
    .required("Поле обязательно")
    .min(1, "Массив не может быть пустым"),
  malesEvents: yup.lazy((value) => {
    if (!isEmpty(value)) {
      const validationObject = { event: yup.string().required("Выберите событие"), date: yup.date().required("Дата обязательна для события") };
      const newEntries = Object.keys(value).reduce(
        (acc, val) => ({
          ...acc,
          [val]: yup.array().of(yup.object(validationObject)),
        }),
        {},
      );

      return yup.object().shape(newEntries);
    }
    return yup.mixed().notRequired();
  }),
  female_prelay_shed_date: yup.string().nullable(),
  female_ovulation_date: yup.string().nullable(),
});

export const defaultVals = {
  female_id: null,
  males_ids: [],
  malesEvents: {},
  female_prelay_shed_date: undefined,
  female_ovulation_date: undefined,
};

export const eventsOpts = [
  { label: "Ссаживание", value: "pairing" },
  { label: "Лок", value: "lock" },
];

export const prepForMm = (parent: IResSnakesList) => {
  return parent.genes.map((a) => {
    if (a.gene === "rec") {
      let trg = a.label.split("% ");
      return trg[trg.length - 1];
    }
    return a.label;
  });
};

export const prepForCreate = (submit): IReqCreateBPBreed => {
  const userId: string = localStorage.getItem("USER")!;

  return {
    males_events: submit.malesEvents,
    owner_id: userId,
    female_prelay_shed_date: submit.female_prelay_shed_date,
    female_ovulation_date: submit.female_ovulation_date,
    female_id: submit.female_id,
    males_ids: submit.males_ids.map((a) => a.snake),
    status: calcStatus(submit),
  };
};

export const prepForUpdate = (sub, dirtyObject, breed_id): IUpdBreedReq => {
  let upd = {};
  let copy = { ...sub };
  delete copy.malesEvents;
  for (let k in copy) {
    if (dirtyObject[k]) {
      upd[k] = sub[k];
    }
  }
  return {
    upd: { ...upd, males_events: sub.malesEvents, status: calcStatus(sub) },
    id: breed_id,
  };
};

const calcStatus = (submit: yup.InferType<typeof breedSchema>) => {
  if (submit.female_prelay_shed_date != null) return "shed";
  if (submit.female_ovulation_date != null) return "ovul";
  if (submit.malesEvents && !isEmpty(submit.malesEvents)) {
    let o = Object.values(submit.malesEvents).flat();

    return o.some((a: any) => a.event === "lock") ? "lock" : "woo";
  }
};

export const renderSelectOption = (option, checked) => (
  <Group flex="1" gap="xs">
    {checked && <IconSwitch icon="check" width="14" height="14" />}
    {option.label}
  </Group>
);

export const sexHardcode = [
  { label: "Самец", value: "male" },
  { label: "Самка", value: "female" },
];
