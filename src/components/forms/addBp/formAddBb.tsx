import { useLocation } from "preact-iso";
import { useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Flex, Group, NumberInput, Radio, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm, useWatch } from "react-hook-form";
import { httpUldSnPic, useCreateBp } from "../../../api/hooks";
import { FileUpload } from "../../../components/fileUpload";
import { GeneSelect } from "../../../components/genetics/geneSelect";
import { Btn } from "../../../components/navs/btn/Btn";
import { notif } from "../../../utils/notif";
import { calcImgUrl, compressImage } from "../../../utils/supabaseImg";
import { defVals, feederHardcode, schema, sexHardcode, uplErr } from "./const";

// TODO сделать проверку родителей и что есть разнополая пара вообще
// TODO в будущем - нужна выпадашка Статус - жива, умерла, карантин, продана ну и чето еще
export const FormAddBp = ({ traits }) => {
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
      { ...sbm, picture },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Змейка сохранена" });
          location.route("/snakes");
        },
        onError: (err) => {
          uplErr(err);
        },
      },
    );
  };

  return (
    <>
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
        <Controller
          name="genes"
          control={control}
          render={({ field: { onChange } }) => {
            return <GeneSelect onChange={(a) => onChange(a)} outer={traits} />;
          }}
        />
        <NumberInput {...(register("weight") as any)} rightSection="г" label="Масса" placeholder="Нет данных" hideControls />
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
        {wOrigin === "purchase" ? (
          <NumberInput
            {...(register("price") as any,
            {
              setValueAs: (value) => value || null,
            })}
            rightSection="₽"
            label="Цена покупки"
            placeholder="Без цены"
            hideControls
            thousandSeparator=" "
          />
        ) : null}
        {/* FIX здесь нужно проверка на наличие разнополой пары */}
        {wOrigin === "breed" ? <div>выпадашки с родителями</div> : null}
      </Flex>

      <Flex gap="lg" wrap="wrap">
        <Controller
          name="last_supper"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput label="Последнее кормление" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" placeholder="Нет данных" />
                {error ? <span>{error?.message}</span> : null}
              </>
            );
          }}
        />
        <Controller
          name="feeding"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <Select data={feederHardcode} value={value} onChange={onChange} label="Кормовой объект" error={error?.message} placeholder="Нет данных" />;
          }}
        />
        <NumberInput
          {...(register("feed_weight") as any,
          {
            setValueAs: (value) => value || null,
          })}
          rightSection="г"
          label="Масса КО"
          placeholder="Нет данных"
          hideControls
        />
      </Flex>

      <Flex align="flex-start" maw="100%" w="100%">
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
          Сохранить
        </Btn>
      </Flex>
    </>
  );
};
