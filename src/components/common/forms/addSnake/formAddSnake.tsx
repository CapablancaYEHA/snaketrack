import { useLocation } from "preact-iso";
import { FC } from "preact/compat";
import { useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Accordion, Box, Flex, Group, NumberInput, Radio, Select, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Feeder } from "@/components/common/Feeder/Feeder";
import { GenesSelect } from "@/components/common/genetics/geneSelect";
import { ECategories, EGenesView, ESupabase, IReqCreateSnake } from "@/api/common";
import { useSupaCreate } from "@/api/hooks";
import { httpUldSnPic } from "@/api/misc/hooks";
import { notif } from "../../../../utils/notif";
import { calcImgUrl, compressImage } from "../../../../utils/supabaseImg";
import { FileUpload } from "../../../fileUpload";
import { Btn } from "../../../navs/btn/Btn";
import { uplErr } from "../const";
import { sexHardcode } from "../snakeBreed/common";
import { defVals, prepareSnakeCreate, schema } from "./const";

interface IProps {
  table: ESupabase;
  storage: ESupabase;
  title: string;
  category: ECategories;
}

export const FormAddSnake: FC<IProps> = ({ table, storage, title, category }) => {
  const { mutate, isPending } = useSupaCreate<IReqCreateSnake>(table);
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
      const { data: r, error: e } = await httpUldSnPic(sbm.picture, storage);
      if (e) {
        uplErr(e);
        return;
      }
      picture = calcImgUrl(r?.fullPath!);
    }
    mutate(
      { ...prepareSnakeCreate(sbm), picture },
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
        Добавить {title}
      </Text>
      <Flex gap="lg" w={{ base: "100%", sm: "70%" }} wrap="nowrap">
        <TextInput {...register("snake_name")} required label="Кличка змеи" error={errors?.snake_name?.message} flex="1 1 50%" />
        <Controller
          name="date_hatch"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput label="Дата рождения" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" required highlightToday locale="ru" error={error?.message} maxDate={new Date()} flex="1 1 50%" />
              </>
            );
          }}
        />
      </Flex>
      <Accordion defaultValue={null} variant="separated" radius="md" w={{ base: "100%", sm: "70%" }}>
        <Accordion.Item value="optional">
          <Accordion.Control fz="xs">Опциональные поля. Можно дополнить/изменить в любое время</Accordion.Control>
          <Accordion.Panel>
            <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
              <Flex gap="lg" wrap="wrap" w="100%">
                <Controller
                  name="genes"
                  control={control}
                  render={({ field: { onChange } }) => {
                    return <GenesSelect onChange={(a) => onChange(a)} label="Морфы" category={category} view={EGenesView.STD} />;
                  }}
                />
              </Flex>
              <Flex gap="lg" wrap="nowrap" w="100%">
                <Controller
                  name="weight"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return (
                      <NumberInput
                        onChange={onChange}
                        value={value as any}
                        name="weight"
                        suffix=" г"
                        label="Масса"
                        placeholder="Нет данных"
                        hideControls
                        error={error?.message}
                        allowNegative={false}
                        allowDecimal={false}
                        allowLeadingZeros={false}
                        flex="1 1 50%"
                      />
                    );
                  }}
                />
                <Controller
                  name="sex"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return <Select data={sexHardcode} value={value} onChange={onChange} label="Пол" error={error?.message} flex="1 1 50%" />;
                  }}
                />
              </Flex>
              <Flex gap="lg" wrap="nowrap" w="100%">
                <Controller
                  name="origin"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return (
                      <Radio.Group label="Змея получена" value={value} onChange={onChange} error={error?.message} flex="1 1 50%">
                        <Group mt="xs">
                          <Radio value="breed" label="Собственным разведением" checked={value === "breed"} />
                          <Radio value="purchase" label="Куплена" checked={value === "purchase"} />
                        </Group>
                      </Radio.Group>
                    );
                  }}
                />
                {wOrigin === "purchase" ? (
                  <NumberInput {...(register("price") as any)} allowDecimal={false} rightSection="₽" label="Цена покупки" placeholder="Без цены" hideControls thousandSeparator=" " flex="1 1 50%" allowLeadingZeros={false} allowNegative={false} />
                ) : null}
              </Flex>

              <Flex gap="lg" wrap="wrap" w="100%">
                <Controller
                  name="feed_last_at"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return (
                      <>
                        <DatePickerInput label="Последнее кормление" flex="0 1 50%" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" placeholder="Дата не указана" maxDate={new Date()} error={error?.message} />
                      </>
                    );
                  }}
                />
                <Controller
                  name="feed_ko"
                  control={control}
                  render={({ field: { onChange }, fieldState: { error } }) => {
                    return <Feeder onChange={onChange} errMsg={error?.message} flex="1 1 50%" />;
                  }}
                />
              </Flex>
              <Flex gap="lg" wrap="nowrap" w="100%">
                <Controller
                  name="feed_weight"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return <NumberInput onChange={onChange} value={value as any} suffix=" г" label="Масса КО" placeholder="Не заполнено" hideControls error={error?.message} allowDecimal={false} flex="1 1 50%" allowLeadingZeros={false} allowNegative={false} />;
                  }}
                />
                <TextInput {...register("feed_comment")} label="Коммент к кормлению" error={errors?.["feed_comment"]?.message} flex="1 1 50%" />
              </Flex>
              <Box maw="100%" w="100%">
                <Textarea {...register("notes")} label="Заметки, примечания" resize="vertical" w="100%" maw="100%" id="txarea_helper_addbp" />
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
              </Flex>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Flex align="flex-start" maw="100%" w="100%" gap="xl">
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isPending} disabled={isPending}>
          Добавить
        </Btn>
      </Flex>
    </>
  );
};
