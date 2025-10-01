import { useLocation } from "preact-iso";
import { useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Flex, Group, NumberInput, Radio, Select, Text, TextInput, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm, useWatch } from "react-hook-form";
import { GenesSelect } from "@/components/common/genetics/geneSelect";
import { FileUpload } from "@/components/fileUpload";
import { Btn } from "@/components/navs/btn/Btn";
import { httpReplacePic, httpUldSnPic } from "@/api/ballpythons/misc";
import { IUpdReq } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { calcImgUrl, compressImage } from "@/utils/supabaseImg";
import { dateToSupabaseTime } from "@/utils/time";
import { sexHardcode } from "../../../ballpythons/forms/bpBreed/common";
import { filterSubmitByDirty, uplErr } from "../const";
import { makeDefault, schema } from "./const";
import styles from "./styles.module.scss";

export const FormEditSnake = ({ init, table, storage, title, category }) => {
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    control,
  } = useForm({
    defaultValues: makeDefault(init),
    resolver: yupResolver(schema as any),
  });

  const [img, setImg] = useState<string | undefined>(init.blob);
  const [wOrigin] = useWatch({ control, name: ["origin"] });
  const resetRef = useRef<() => void>(null);

  const { mutate, isPending } = useSupaUpd<IUpdReq>(table);

  const onSub = async (sbm) => {
    let picture: string | null = null;
    if (sbm.picture != null) {
      if (init.blob != null) {
        const { data: rep, error: er } = await httpReplacePic(init.blob, sbm.picture, storage);
        if (er) {
          uplErr(er);
          return;
        }
        picture = calcImgUrl(rep?.fullPath!);
      } else {
        const { data: upl, error: e } = await httpUldSnPic(sbm.picture, storage);
        if (e) {
          uplErr(e);
          return;
        }
        picture = calcImgUrl(upl?.fullPath!);
      }
    }

    const submitBody = filterSubmitByDirty(sbm, dirtyFields);

    mutate(
      {
        upd: {
          ...submitBody,
          picture: picture || undefined,
          last_action: "update",
          date_hatch: dateToSupabaseTime(sbm.date_hatch),
        },
        id: location.query.id,
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Запись изменена" });
          location.route("/snakes");
        },
        onError: (err) => {
          notif({ c: "red", m: err.message });
        },
      },
    );
  };

  return (
    <>
      <Text size="md" fw={500} c="yellow.6">
        Редактирование {title}
      </Text>
      <Flex gap="lg" className={styles.w70} wrap="nowrap">
        <TextInput {...register("snake_name")} required label="Кличка змеи" error={errors?.snake_name?.message} flex="1 1 50%" />
        <Controller
          name="date_hatch"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput label="Дата рождения" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" flex="1 1 50%" required highlightToday locale="ru" error={error?.message} maxDate={new Date()} />
              </>
            );
          }}
        />
      </Flex>
      <Flex gap="lg" wrap="wrap" className={styles.w70}>
        <Controller
          name="genes"
          control={control}
          render={({ field: { onChange, value } }) => {
            return <GenesSelect onChange={(a) => onChange(a)} init={value} label="Морфы" category={category} />;
          }}
        />
      </Flex>
      <Flex gap="lg" wrap="nowrap" className={styles.w70}>
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
          <Controller
            name="price"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput rightSection="₽" label="Цена покупки" flex="1 1 50%" placeholder="Без цены" hideControls thousandSeparator=" " error={error} value={value} onChange={onChange} allowDecimal={false} allowLeadingZeros={false} />;
            }}
          />
        ) : null}
      </Flex>

      <Flex gap="lg" wrap="nowrap" className={styles.w70}>
        <Controller
          name="sex"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <Select data={sexHardcode} value={value} onChange={onChange} label="Пол" error={error?.message} flex="0 1 50%" />;
          }}
        />
        {/* FIX здесь нужно проверка на наличие разнополой пары */}
        {/* {wOrigin === "breed" ? <div>выпадашки с родителями</div> : null} */}
      </Flex>
      <Box className={styles.w70} maw="100%">
        <Textarea {...register("notes")} label="Заметки, примечания" w="100%" maw="100%" autosize id="txarea_helper_editSnake" />
      </Box>
      <Flex align="flex-start" maw="100%" className={styles.w70}>
        <Controller
          name="picture"
          control={control}
          render={({ field: { onChange }, fieldState: { error } }) => {
            return (
              <FileUpload
                ref={resetRef}
                clearFile={() => {
                  setImg(undefined);
                  resetRef.current?.();
                  onChange(null);
                }}
                onUpload={async (a) => await compressImage(a!, onChange, setImg)}
                url={img || null}
                err={error?.message}
                withRemove={false}
              />
            );
          }}
        />
      </Flex>
      <Flex align="flex-start" maw="100%" w="100%" gap="xl">
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isPending} disabled={!isDirty}>
          Сохранить
        </Btn>
      </Flex>
    </>
  );
};
