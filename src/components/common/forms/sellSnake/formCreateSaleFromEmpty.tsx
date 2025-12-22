import { useLocation } from "preact-iso";
import { useEffect, useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Flex, NumberInput, Select, Text, TextInput, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { debounce, isEmpty } from "lodash-es";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Autocomp } from "@/components/common/forms/sellSnake/Autocomp";
import { GenesSelect } from "@/components/common/genetics/geneSelect";
import { FileUploadMulti } from "@/components/fileUploadMulti";
import { Btn } from "@/components/navs/btn/Btn";
import { EGenesView, ESupabase, ICreateSaleReq, categoryToBaseTable, categoryToBucket } from "@/api/common";
import { useDadata, useSupaCreate } from "@/api/hooks";
import { httpUldSnPic } from "@/api/misc/hooks";
import { notif } from "@/utils/notif";
import { calcImgUrl, compressMulti } from "@/utils/supabaseImg";
import { uplErr } from "../const";
import { sexHardcode } from "../snakeBreed/common";
import styles from "../styles.module.scss";
import { IReqCreateSnakeForAdv, ISellEmptyScheme, createSnakeFromEmpty, emptyDefault, schemaEmpty } from "./const";

export const FormCreateSaleFromEmpty = ({ category }) => {
  const location = useLocation();
  const {
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    getValues,
    trigger,
  } = useForm<ISellEmptyScheme>({
    defaultValues: emptyDefault,
    resolver: yupResolver(schemaEmpty),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [wGenes] = useWatch({ control, name: ["genes"] });

  const [imgs, setImgs] = useState<string[] | undefined>(undefined);
  const resetRef = useRef<() => void>(null);
  const [val, setVal] = useState("");
  const { mutate: search, data, isPending } = useDadata();
  const { mutate: createSnake, isPending: isMutSnakePend } = useSupaCreate<IReqCreateSnakeForAdv>(categoryToBaseTable[category]);
  const { mutate: createAdv, isPending: isMutAdvPend } = useSupaCreate<ICreateSaleReq>(ESupabase.MRKT, { qk: [ESupabase.MRKT_V], e: false });

  const debSearch = debounce(setVal, 400);

  const onSub = async (sbm: ISellEmptyScheme) => {
    let pics: string[] | null = null;

    try {
      const res = await Promise.all(sbm.pictures.map((p) => httpUldSnPic(p, categoryToBucket[category])));
      pics = res.map((dt: any) => calcImgUrl(dt.data?.fullPath!));
    } catch (e) {
      uplErr(e);
      return;
    }

    createSnake(
      { ...createSnakeFromEmpty(sbm), picture: pics?.flat()?.[0] },
      {
        onSuccess: (res) => {
          createAdv(
            {
              sale_price: sbm.sale_price,
              description: sbm.description,
              city_code: sbm.city_code,
              city_name: sbm.city_name,
              contacts_group: sbm.contacts_group,
              contacts_telegram: sbm.contacts_telegram,
              category,
              snake_id: res.data.id,
              pictures: pics?.flat() as any,
              country: "RU",
              status: "on_sale",
            },
            {
              onSuccess: () => {
                notif({ c: "green", t: "Успешно", m: "Объявление размещено" });
                location.route("/market");
              },
              onError: (err) => {
                notif({ c: "red", m: err.message });
              },
            },
          );
        },
        onError: (err) => {
          notif({ c: "red", m: err.message });
        },
      },
    );
  };

  useEffect(() => {
    if (val.length > 1) {
      search(val);
    }
  }, [val, search]);

  return (
    <>
      <Box>
        <Text size="sm">Для случая, когда змея не заведена в коллекции, и вы просто хотите выставить её на продажу. При этом, карточка змеи будет автоматически создана в профиле и при необходимости всегда можно начать вести её статистику</Text>
      </Box>
      <Flex align="stretch" gap="sm" className={styles.w70}>
        <Controller
          name="date_hatch"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput label="Дата рождения" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" required highlightToday locale="ru" error={error?.message} maxDate={new Date()} flex="1 1 auto" />
              </>
            );
          }}
        />
      </Flex>
      <Flex gap="sm" className={styles.w70} style={{ flexFlow: "row wrap" }}>
        <Controller
          name="genes"
          control={control}
          render={({ field: { onChange } }) => {
            return <GenesSelect onChange={(a) => onChange(a)} label="Морфы" category={category} view={EGenesView.STD} />;
          }}
        />
      </Flex>
      <Flex gap="lg" className={styles.w70} wrap="nowrap">
        <Controller
          name="snake_name"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput required onChange={onChange} value={value || wGenes?.map((h) => h.label).join(", ")} label="Кличка змеи" error={error?.message} flex="1 1 50%" />;
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
      <Flex align="flex-start" maw="100%" className={styles.w70}>
        <Controller
          name="pictures"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <FileUploadMulti
                ref={resetRef}
                clearFile={(index) => {
                  setImgs((s) => {
                    const pre = s?.filter((b, ind) => ind !== index);
                    if (isEmpty(pre)) {
                      resetRef.current?.();
                      onChange(null);
                      setValue("pictures", null as any, { shouldDirty: true });
                      return undefined;
                    }
                    const filteredField = getValues("pictures")?.filter((b, ind) => ind !== index);
                    setValue("pictures", filteredField, { shouldDirty: true });
                    return pre;
                  });
                }}
                clearAll={() => {
                  setImgs(undefined);
                  resetRef.current?.();
                  setValue("pictures", null as any, { shouldDirty: true });
                  onChange(null);
                }}
                onUpload={(files) => files?.forEach(async (a) => await compressMulti(a, (b) => onChange([...(getValues("pictures") ?? []), b]), setImgs))}
                url={imgs?.filter((a) => a) || null}
                err={error?.message}
              />
            );
          }}
        />
      </Flex>
      <Flex align="flex-start" maw="100%" className={styles.w70} gap="lg">
        <Controller
          name="sale_price"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <NumberInput required rightSection="₽" label="Цена продажи" flex="1 1 auto" hideControls thousandSeparator=" " error={error?.message} value={value} onChange={onChange} allowDecimal={false} allowLeadingZeros={false} allowNegative={false} />;
          }}
        />
        <Box flex="1 1 auto">
          <Autocomp
            label="Город"
            required
            data={data}
            onChange={debSearch}
            onOptionSubmit={(a) => {
              setValue("city_code", a.city_code, { shouldDirty: true });
              setValue("city_name", a.city_name);
              trigger("city_code");
            }}
            value={val}
            isPending={isPending}
            error={errors?.city_code?.message}
          />
        </Box>
      </Flex>
      <Flex align="flex-start" maw="100%" className={styles.w70} gap="lg">
        <Controller
          name="contacts_group"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput label="Группа в VK" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} />;
          }}
        />
        <Controller
          name="contacts_telegram"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput label="Ник в Телеге" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} placeholder="юзернейм с или без @" />;
          }}
        />
      </Flex>
      <Box className={styles.w70} maw="100%">
        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <Textarea
                required
                placeholder="О змее, доставке, рассрочке"
                label="Основной блок объявления"
                resize="vertical"
                w="100%"
                maw="100%"
                minRows={4}
                id="txarea_helper_addsell"
                onChange={onChange}
                value={value}
                error={error?.message}
                autosize
                styles={{ wrapper: { height: "100%" }, input: { height: 120 } }}
              />
            );
          }}
        />
      </Box>
      <Flex align="flex-start" maw="100%" gap="xl" className={styles.w70}>
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isMutSnakePend || isMutAdvPend}>
          Создать
        </Btn>
      </Flex>
    </>
  );
};
