import { useLocation } from "preact-iso";
import { useEffect, useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Flex, NumberInput, Select, Stack, Text, Textarea } from "@mantine/core";
import { debounce, isEmpty } from "lodash-es";
import { Controller, useForm } from "react-hook-form";
import { Autocomp } from "@/components/common/forms/sellSnake/Autocomp";
import { GenePill } from "@/components/common/genetics/geneSelect";
import { FileUploadMulti } from "@/components/fileUploadMulti";
import { Btn } from "@/components/navs/btn/Btn";
import { httpUldSnPic } from "@/api/ballpythons/misc";
import { ESupabase, IEditSaleReq, IUpdReq, categoryToBaseTable, categoryToBucket } from "@/api/common";
import { useDadata, useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { calcImgUrl, compressMulti } from "@/utils/supabaseImg";
import { dateToSupabaseTime, getAge, getDate } from "@/utils/time";
import { sortSnakeGenes } from "../../genetics/const";
import { SexName } from "../../sexName";
import { categToTitle } from "../../utils";
import { filterSubmitByDirty, uplErr } from "../const";
import styles from "../editSnake/styles.module.scss";
import { adStatsHardcode } from "../snakeBreed/common";
import { ISellScheme, schema } from "./const";

export const FormEditSale = ({ init, info, category }) => {
  const location = useLocation();
  const {
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, dirtyFields },
    control,
  } = useForm<ISellScheme>({
    defaultValues: init,
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [imgs, setImgs] = useState<any[] | undefined>(info.blob);
  const resetRef = useRef<() => void>(null);
  const [val, setVal] = useState("");
  const { mutate: search, data, isPending } = useDadata();
  const { mutate: updAd, isPending: isAdPend } = useSupaUpd<IEditSaleReq>(ESupabase.MRKT, { qk: [ESupabase.MRKT_V], e: false });
  const { mutate } = useSupaUpd<IUpdReq>(categoryToBaseTable[category]);

  const debSearch = debounce(setVal, 400);

  const onSub = async (sbm: ISellScheme) => {
    let pics: string[] | null = null;

    if (sbm.pictures.length === info.blob.length && !dirtyFields["pictures"]) {
      pics = info.blob;
    } else if (dirtyFields["pictures"]) {
      try {
        const res = await Promise.all(sbm.pictures.map((p) => httpUldSnPic(p, categoryToBucket[category])));
        pics = res.map((dt) => calcImgUrl(dt.data?.fullPath!));
      } catch (e) {
        uplErr(e);
        return;
      }
    }

    const submitBody = filterSubmitByDirty(sbm, dirtyFields) as any;

    updAd(
      {
        upd: {
          ...submitBody,
          pictures: pics || undefined,
          ...(submitBody.status === "sold" ? { completed_at: dateToSupabaseTime(new Date()) } : { updated_at: dateToSupabaseTime(new Date()) }),
        },
        id: location.query.id,
      },
      {
        onSuccess: async () => {
          await mutate({
            upd: {
              status: submitBody.status,
              last_action: "update",
            },
            id: info.snake_id,
          });
          await notif({ c: "green", t: "Успешно", m: "Объявление изменено" });
          location.route("/market");
        },
        onError: (err) => {
          notif({ c: "red", m: err.message });
        },
      },
    );
  };

  useEffect(() => {
    reset(init, { keepDirty: false });
  }, [init, reset]);

  useEffect(() => {
    if (val.length > 1) {
      search(val);
    }
  }, [val, search]);

  return (
    <>
      <Flex align="stretch" gap="sm" className={styles.w70col}>
        <Stack gap="sm">
          <Flex justify="flex-start" gap="xs" align="center">
            <Text fw={500}>{categToTitle[category]}</Text>
            <SexName sex={info.sex} name={info.snake_name} />
          </Flex>
        </Stack>
        <Stack gap="xs">
          <Text size="sm">Дата рождения — {getDate(info.date_hatch)}</Text>
          <Text size="sm">⌛ {getAge(info.date_hatch)}</Text>
        </Stack>
      </Flex>
      <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
        {sortSnakeGenes(info.genes as any).map((a) => (
          <GenePill item={a} key={`${a.label}_${a.id}`} />
        ))}
      </Flex>
      <Flex align="flex-start" maw="100%" className={styles.w70}>
        <Controller
          name="pictures"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <FileUploadMulti
                ref={resetRef}
                clearFile={(a) => {
                  setImgs((s) => {
                    const pre = s?.filter((b, ind) => ind !== a);
                    if (isEmpty(pre)) {
                      resetRef.current?.();
                      onChange(null);
                      setValue("pictures", null as any);
                      return undefined;
                    }
                    return pre;
                  });
                }}
                clearAll={() => {
                  setImgs(undefined);
                  resetRef.current?.();
                  setValue("pictures", null as any);
                  onChange(null);
                }}
                onUpload={(files) => files?.forEach(async (a) => await compressMulti(a, (b) => onChange([...(value ?? []), b]), setImgs))}
                url={imgs?.filter((a) => a) || null}
                err={error?.message}
              />
            );
          }}
        />
      </Flex>
      <Flex align="flex-start" maw="100%" className={styles.w70} gap="lg">
        <Controller
          name={"status"}
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <Select allowDeselect={false} required data={adStatsHardcode} value={value} onChange={onChange} label={"Статус"} error={error?.message} size="sm" flex="1 1 50%" />;
          }}
        />
        <Controller
          name="sale_price"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <NumberInput required rightSection="₽" label="Цена продажи" flex="1 1 50%" hideControls thousandSeparator=" " error={error?.message} value={value} onChange={onChange} allowDecimal={false} allowLeadingZeros={false} allowNegative={false} />;
          }}
        />
      </Flex>
      <Flex gap="lg" wrap="nowrap" className={styles.w70col}>
        <Box>
          <Autocomp
            required
            data={data}
            onChange={debSearch}
            onOptionSubmit={(a) => {
              setValue("city_code", a.city_code);
              setValue("city_name", a.city_name);
            }}
            value={val || init.city_name}
            isPending={isPending}
          />
        </Box>
      </Flex>
      <Box className={styles.w70} maw="100%">
        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <Textarea
                required
                placeholder="О змее, доставке, рассрочке, контакты"
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
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isPending} disabled={!isDirty || isAdPend}>
          Сохранить
        </Btn>
      </Flex>
    </>
  );
};
