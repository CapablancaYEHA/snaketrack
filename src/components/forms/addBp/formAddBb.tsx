import { useLocation } from "preact-iso";
import { FC } from "preact/compat";
import { useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Flex, Group, NumberInput, Radio, Select, Text, TextInput, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm, useWatch } from "react-hook-form";
import { IGenesBpComp } from "@/api/models";
import { httpUldSnPic, useCreateBp } from "../../../api/hooks";
import { FileUpload } from "../../../components/fileUpload";
import { GeneSelect } from "../../../components/genetics/geneSelect";
import { Btn } from "../../../components/navs/btn/Btn";
import { notif } from "../../../utils/notif";
import { calcImgUrl, compressImage } from "../../../utils/supabaseImg";
import { sexHardcode } from "../bpBreed/common";
import { defVals, feederHardcode, prepareForSubmit, schema, uplErr } from "./const";

// TODO сделать проверку родителей и что есть разнополая пара вообще
// TODO в будущем - нужна выпадашка Статус - жива, умерла, карантин, продана ну и чето еще
type IProp = {
  traits: IGenesBpComp[];
};
export const FormAddBp: FC<IProp> = ({ traits }) => {
  const { mutate, isPending } = useCreateBp();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: defVals,
    resolver: yupResolver(schema as any),
  });
  const [img, setImg] = useState<string | null>(null);
  const [wOrigin] = useWatch({ control, name: ["origin"] });
  const resetRef = useRef<() => void>(null);

  const onSub = async (sbm) => {
    let picture: string | null = null;
    if (sbm.picture != null) {
      const { data: r, error: e } = await httpUldSnPic(sbm.picture);
      if (e) {
        uplErr(e);
        return;
      }
      picture = calcImgUrl(r?.fullPath!);
    }
    mutate(
      { ...prepareForSubmit(sbm), picture },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Змейка сохранена" });
          location.route("/snakes");
        },
        onError: async (err) => {
          notif({
            c: "red",
            t: "Ошибка",
            m: JSON.stringify(err),
            code: err.code || err.statusCode,
          });
        },
      },
    );
  };

  return (
    <>
      <Text size="md" fw={500} c="yellow.6">
        Добавить Региуса
      </Text>
      <Flex gap="lg" wrap="wrap">
        <TextInput {...register("snake_name")} required label="Кличка змеи" error={errors?.snake_name?.message} />
        <Controller
          name="sex"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <Select data={sexHardcode} value={value} onChange={onChange} label="Пол" error={error?.message} />;
          }}
        />
      </Flex>
      <Flex gap="lg" wrap="wrap">
        {traits?.length === 0 ? (
          <TextInput label="Набор генов" placeholder="Normal, no Het" disabled />
        ) : (
          <Controller
            name="genes"
            control={control}
            render={({ field: { onChange } }) => {
              return <GeneSelect onChange={(a) => onChange(a)} outer={traits} />;
            }}
          />
        )}
        <Controller
          name="weight"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <NumberInput onChange={onChange} value={value as any} name="weight" rightSection="г" label="Масса" placeholder="Нет данных" hideControls error={error?.message} />;
          }}
        />
      </Flex>
      <Flex gap="lg" wrap="wrap">
        <Controller
          name="date_hatch"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput label="Дата рождения" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" required highlightToday locale="ru" error={error?.message} maxDate={new Date()} />
              </>
            );
          }}
        />
        <Controller
          name="origin"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <Radio.Group label="Змея получена" value={value} onChange={onChange} error={error?.message}>
                  <Group mt="xs">
                    <Radio value="breed" label="Собственным разведением" checked={value === "breed"} />
                    <Radio value="purchase" label="Куплена" checked={value === "purchase"} />
                  </Group>
                </Radio.Group>
              </>
            );
          }}
        />
      </Flex>

      <Flex gap="lg" wrap="wrap">
        {wOrigin === "purchase" ? <NumberInput {...(register("price") as any)} rightSection="₽" label="Цена покупки" placeholder="Без цены" hideControls thousandSeparator=" " /> : null}
        {/* FIX здесь нужно проверка на наличие разнополой пары */}
        {wOrigin === "breed" ? <div>выпадашки с родителями</div> : null}
      </Flex>

      <Flex gap="lg" wrap="wrap">
        <Controller
          name="feed_last_at"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput label="Последнее кормление" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" placeholder="Нет данных" maxDate={new Date()} error={error?.message} />
              </>
            );
          }}
        />
        <Controller
          name="feed_ko"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <Select data={feederHardcode} value={value} onChange={onChange} label="Кормовой объект" error={error?.message} placeholder="Нет данных" searchable />;
          }}
        />
        <NumberInput {...(register("feed_weight") as any)} name="feed_weight" rightSection="г" label="Масса КО" placeholder="Нет данных" hideControls />
        <TextInput {...register("feed_comment")} label="Коммент к кормлению" error={errors?.["feed_comment"]?.message} />
      </Flex>
      <Box w="100%" maw="100%">
        <Textarea {...register("notes")} label="Заметки, примечания" resize="vertical" w="100%" maw="100%" size="lg" />
      </Box>
      <Flex align="flex-start" maw="100%" w="100%" gap="xl">
        <Controller
          name="picture"
          control={control}
          render={({ field: { onChange }, fieldState: { error } }) => {
            return (
              <FileUpload
                ref={resetRef}
                clearFile={() => {
                  setImg(null);
                  resetRef.current?.();
                  onChange(null);
                }}
                onUpload={async (a) => await compressImage(a!, onChange, setImg)}
                url={img}
                err={error?.message}
              />
            );
          }}
        />
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isPending}>
          Добавить
        </Btn>
      </Flex>
    </>
  );
};
