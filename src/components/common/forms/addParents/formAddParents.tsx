import { useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Flex, Radio, SegmentedControl, Select, Space, Stack } from "@mantine/core";
import { debounce } from "lodash-es";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ECategories, IResSnakesList, IUpdReq, categoryToBaseTable } from "@/api/common";
import { snakeListByGender } from "@/api/common_configs";
import { invalidateBpTree, useSupaGet, useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { AutocompAsync } from "../../RelativeTree/AutocompAsync";
import { IParentsSchema, defVals, parentsSchema } from "./const";

// FIXME category = ECategories.BP после расширения на всех змей
export const FormAddParents = ({ category = ECategories.BP, snakeId }) => {
  const userId = localStorage.getItem("USER");
  const { handleSubmit, control, setValue } = useForm({
    defaultValues: defVals,
    resolver: yupResolver(parentsSchema),
  });

  const [wParent, wSource] = useWatch({ control, name: ["parent", "source"] });
  const [femSearch, setFemSearch] = useState("");
  const [maleSearch, setMaleSearch] = useState("");
  const debFemSearch = debounce(setFemSearch, 400);
  const debMaleSearch = debounce(setMaleSearch, 400);
  const isFemEbl = (category === ECategories.BP ? femSearch?.length >= 10 : femSearch?.length >= 36) && !femSearch?.includes("_");
  const isMaleEbl = (category === ECategories.BP ? maleSearch?.length >= 10 : maleSearch?.length >= 36) && !maleSearch?.includes("_");

  const { data: regFems } = useSupaGet<IResSnakesList[]>(snakeListByGender(category, "female", userId), userId != null);
  const { data: regMales } = useSupaGet<IResSnakesList[]>(snakeListByGender(category, "male", userId), userId != null);
  const { data: femTrg, isFetching: isFemFetch } = useSupaGet<IResSnakesList>({ t: categoryToBaseTable[category], f: (b) => b.eq("id", femSearch).limit(1).single(), id: femSearch }, isFemEbl);
  const { data: maleTrg, isFetching: isMaleFetch } = useSupaGet<IResSnakesList>({ t: categoryToBaseTable[category], f: (b) => b.eq("id", maleSearch).limit(1).single(), id: maleSearch }, isMaleEbl);
  const { mutate, isPending } = useSupaUpd<IUpdReq>(categoryToBaseTable[category]);

  const onSub = (sbm: IParentsSchema) => {
    mutate(
      {
        upd: {
          father_id: sbm.father_id,
          mother_id: sbm.mother_id,
        },
        id: snakeId,
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Инфа о родителях добавлена" });
          invalidateBpTree(snakeId);
        },
        onError: (err) => {
          notif({ c: "red", m: err.message });
        },
      },
    );
  };

  return (
    <Stack gap="sm">
      <Controller
        name="parent"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <SegmentedControl
              size="xs"
              value={value}
              onChange={onChange}
              w="100%"
              maw="100%"
              data={[
                {
                  label: "Мать (Dam)",
                  value: "mother",
                },
                {
                  label: "Отец (Sire)",
                  value: "father",
                },
              ]}
            />
          );
        }}
      />
      <Controller
        name="source"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <Radio.Group label="Выбор змеи" value={value} onChange={onChange} flex="1 1 50%">
              <Flex maw="100%" w="100%" gap="xs" pt="sm">
                <Radio value="collection" label="Среди своей коллекции" checked={value === "collection"} />
                <Radio value="global" label="По Id от другого бридера" checked={value === "global"} />
              </Flex>
            </Radio.Group>
          );
        }}
      />
      {wParent === "mother" ? (
        <Controller
          name="mother_id"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return wSource === "collection" ? (
              <Select data={regFems?.map((b) => ({ label: b.snake_name, value: b.id }))} value={value} onChange={onChange} label="Выбор в своей коллекции" error={error?.message} />
            ) : (
              <AutocompAsync
                data={femTrg ? [femTrg] : undefined}
                onChange={debFemSearch}
                onOptionSubmit={(a) => {
                  setValue("mother_id", a.id);
                }}
                value={femSearch}
                isPending={isFemFetch}
                error={error?.message}
              />
            );
          }}
        />
      ) : null}

      {wParent === "father" ? (
        <Controller
          name="father_id"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return wSource === "collection" ? (
              <Select data={regMales?.map((b) => ({ label: b.snake_name, value: b.id }))} value={value} onChange={onChange} label="Выбор в своей коллекции" error={error?.message} />
            ) : (
              <AutocompAsync
                data={maleTrg ? [maleTrg] : undefined}
                onChange={debMaleSearch}
                onOptionSubmit={(a) => {
                  setValue("father_id", a.id);
                }}
                value={maleSearch}
                isPending={isMaleFetch}
                error={error?.message}
              />
            );
          }}
        />
      ) : null}
      <Space h="md" />
      <Button size="compact-xs" variant="default" onClick={handleSubmit(onSub)} disabled={isPending}>
        Сохранить
      </Button>
    </Stack>
  );
};
