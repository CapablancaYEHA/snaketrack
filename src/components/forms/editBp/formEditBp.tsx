import { useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Flex, Group, NumberInput, Radio, Select, Text, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FileUpload } from "@/components/fileUpload";
import { GeneSelect } from "@/components/genetics/geneSelect";
import { Btn } from "@/components/navs/btn/Btn";
import { httpUldSnPic, useCreateBp } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { calcImgUrl, compressImage } from "@/utils/supabaseImg";
import { makeDefault, schema, sexHardcode, uplErr } from "./const";

// FIXME !!!!!
export const FormEditBp = ({ traits, init }) => {
  const { mutate, isPending } = useCreateBp();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = useForm({
    defaultValues: makeDefault(init),
    resolver: yupResolver(schema as any),
  });

  const [img, setImg] = useState<string | null>(init.picture);
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
    // mutate(
    //   { ...sbm, picture },
    //   {
    //     onSuccess: () => {
    //       notif({ c: "green", t: "Успешно", m: "Змейка сохранена" });
    //       location.route("/snakes");
    //     },
    //     onError: (err) => {
    //        notif({ c: "red",  m: err.message});
    //     },
    //   },
    // );
  };

  console.log("errors", errors);
  return (
    <>
      <Text size="md" fw={500} c="yellow.4">
        Редактирование данных
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
        <Controller
          name="genes"
          control={control}
          render={({ field: { onChange, value } }) => {
            return <GeneSelect onChange={(a) => onChange(a)} outer={traits} init={value} />;
          }}
        />
        <Controller
          name="weight"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <NumberInput rightSection="г" label="Масса" placeholder="Нет данных" hideControls error={error} value={isNaN(value) ? null : value} onChange={onChange} />;
          }}
        />
      </Flex>
      <Flex gap="lg" wrap="wrap">
        1
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
          <Controller
            name="price"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput rightSection="₽" label="Цена покупки" placeholder="Без цены" hideControls thousandSeparator=" " error={error} value={value || null} onChange={onChange} />;
            }}
          />
        ) : null}
        {/* FIX здесь нужно проверка на наличие разнополой пары */}
        {wOrigin === "breed" ? <div>выпадашки с родителями</div> : null}
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
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isPending} disabled={!isDirty}>
          Сохранить
        </Btn>
      </Flex>
    </>
  );
};
