import { useLocation } from "preact-iso";
import { FC } from "preact/compat";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { startSm } from "@/styles/theme";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Box, Button, Divider, Drawer, Flex, Modal, NumberInput, Select, Space, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { debounce, isEmpty } from "lodash-es";
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useFormState } from "react-hook-form";
import { FileUploadMulti } from "@/components/fileUploadMulti";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, ESupabase, ICreateSaleReq, IResSnakesList, categoryToBucket } from "@/api/common";
import { useBase64, useDadata, useSupaCreate, useSupaMassUpd } from "@/api/hooks";
import { httpUldSnPic } from "@/api/misc/hooks";
import { IResProfile } from "@/api/profile/models";
import { notif } from "@/utils/notif";
import { calcImgUrl, compressMulti, compressNoHandlers } from "@/utils/supabaseImg";
import { getAge } from "@/utils/time";
import { adStatsHardcode, disStats, mrktActiveStats } from "../../Market/utils";
import { sortSnakeGenes } from "../../genetics/const";
import { GenePill } from "../../genetics/geneSelect";
import { SexName } from "../../sexName";
import { uplErr } from "../const";
import { Autocomp } from "./Autocomp";
import { IMassSale, IMassUpd, schemaMassSale } from "./const";

const sigItemIndex = signal<number | undefined>(undefined);
const sigItemId = signal<string | undefined>(undefined);
const sigModOpen = signal<boolean>(false);

type IProp = {
  opened: boolean;
  close: () => void;
  snakes: IResSnakesList[] | undefined;
  onSucc: Function;
  table: ESupabase;
  category: ECategories;
  profile?: IResProfile;
};

export const FormMassSale: FC<IProp> = ({ opened, close, snakes, category, table, onSucc, profile }) => {
  const location = useLocation();
  const [isDis, seIsDis] = useState(false);
  const isMinSm = useMediaQuery(startSm);
  const { mutate: massCreate, isPending: isCrPend } = useSupaCreate<ICreateSaleReq[]>(ESupabase.MRKT, { qk: [ESupabase.MRKT_V], e: false }, true);
  const { mutate: massUpd, isPending } = useSupaMassUpd<IMassUpd>({
    t: table,
  });
  const lastIndex = useRef<any>({});
  const filtered = snakes?.filter((f) => !disStats.concat(mrktActiveStats).includes(f.status));

  const innerInstance = useForm<IMassSale>({
    defaultValues: {
      city_code: undefined,
      city_name: undefined,
      contacts_group: undefined,
      contacts_telegram: undefined,
      contacts_website: undefined,
      future_advertisments: filtered?.map(() => ({
        sale_price: undefined,
        pictures: undefined,
        description: "Самовывоз и доставка обсуждаемы",
        adv_status: undefined,
        discount_until: undefined,
        discount_price: undefined,
      })),
    },
    resolver: yupResolver(schemaMassSale),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const {
    resetField,
    reset,
    trigger,
    formState: { errors, dirtyFields, isSubmitted },
    control,
    handleSubmit,
    setValue,
  } = innerInstance;

  const { fields: futureAdv, replace: replaceInit } = useFieldArray<any, any, keyof IResSnakesList | "identifier">({
    control,
    name: "future_advertisments",
    keyName: "identifier",
  });

  const trg = futureAdv?.find((f) => f.identifier === sigItemId.value);

  const fullClose = () => {
    reset();
    close();
    lastIndex.current = {};
  };

  const onSub = async (sbm: IMassSale) => {
    seIsDis(true);
    let pics: (string[] | null)[] | null = null;
    const pre = sbm.future_advertisments.map((p) => p.pictures);

    pics = await Promise.all(
      pre.map(async (p, index) => {
        try {
          if (!dirtyFields["future_advertisments"]?.[index].pictures) {
            return [(sbm.future_advertisments[index] as any).picture];
          }
          const proc = await Promise.all(p.map((i) => httpUldSnPic(i, categoryToBucket[category])));
          let url = proc.map((dt: any) => calcImgUrl(dt.data?.fullPath!));
          return url;
        } catch (e) {
          uplErr(e);
          return null;
        }
      }),
    );

    const animals = sbm.future_advertisments.map((p, ind) => {
      return {
        sale_price: p.sale_price,
        pictures: pics?.[ind],
        description: p.description,
        discount_until: p.discount_until,
        discount_price: p.discount_price,
        city_code: sbm.city_code,
        city_name: sbm.city_name,
        contacts_group: sbm.contacts_group,
        contacts_telegram: sbm.contacts_telegram,
        contacts_website: sbm.contacts_website,
        category,
        snake_id: p.id as any,
        status: p.adv_status as any,
        country: "RU",
      };
    });

    massCreate(animals as any, {
      onSuccess: () => {
        massUpd({
          upd: sbm.future_advertisments.map((b: any) => ({
            ...(category === ECategories.BP ? { pre_id: b.pre_id } : { id: b.id }),
            status: b.adv_status,
            last_action: "update",
          })) as any,
        });
        seIsDis(false);
        fullClose();
        onSucc();
        notif({ c: "green", t: "Успешно", m: animals?.length > 1 ? "Объявления размещены" : "Объявление размещено" });
        location.route("/market");
      },
      onError: (e) => {
        seIsDis(false);
        notif({ c: "red", m: e.message });
      },
    });
  };

  useEffect(() => {
    if (profile) {
      setValue("city_code", profile.contacts_city_code as any);
      setValue("city_name", profile.contacts_city_name);
      setValue("contacts_group", profile.contacts_group);
      setValue("contacts_telegram", profile.contacts_telegram);
      setValue("contacts_website", profile.contacts_website);
    }
  }, [profile, resetField, setValue]);

  useEffect(() => {
    if (opened && filtered && filtered.length > 0) {
      replaceInit(filtered);
    }
  }, [opened, replaceInit, JSON.stringify(filtered)]);

  return (
    <Drawer
      opened={opened}
      onClose={fullClose}
      title={<Title order={5}>{(filtered?.length ?? 0) > 1 ? "Массовая продажа" : "На продажу"}</Title>}
      position="left"
      size="100%"
      keepMounted={false}
      withinPortal
      transitionProps={{ transition: "slide-left", duration: 150, timingFunction: "linear" }}
      styles={{
        content: {
          height: "auto",
          width: "auto",
          maxWidth: isMinSm ? "640px" : "90%",
        },
      }}
    >
      <Flex gap="xs">
        <Text size="sm">Заполните/проверьте ваши контактные данные</Text>
        <Button size="compact-xs" onClick={() => (sigModOpen.value = true)} variant="default" flex="0 0 auto">
          Открыть
        </Button>
        {errors["city_code"] ? <IconSwitch icon="warning" /> : null}
      </Flex>
      <Modal
        styles={{
          content: { overflow: "visible" },
        }}
        centered
        opened={sigModOpen.value}
        onClose={() => {
          sigModOpen.value = false;
          trigger("city_code");
        }}
        size="sm"
        title={<Title order={5}>Контакты</Title>}
        keepMounted={false}
      >
        <FormProvider {...innerInstance}>
          <SContactsModal />
        </FormProvider>
      </Modal>
      <Space h="md" />
      {futureAdv && futureAdv.length > 0 ? (
        <div>
          {futureAdv.map((s, ind) => {
            return (
              <Stack key={s.identifier}>
                <Flex maw="100%" w="100%" gap="xs">
                  <Stack gap="4px">
                    <SexName sex={s.sex} name={s.snake_name} />
                    <Text size="sm">⌛ {getAge(s.date_hatch)}</Text>
                  </Stack>
                  <Button
                    size="compact-xs"
                    onClick={() => {
                      sigItemIndex.value = ind;
                      sigItemId.value = s.identifier;
                    }}
                    variant="default"
                    ml="auto"
                  >
                    Заполнить
                  </Button>
                  {lastIndex.current[ind] || (isSubmitted && !isEmpty(errors["future_advertisments"])) ? (
                    <IconSwitch icon={errors["future_advertisments"]?.[ind] ? "warning" : "check"} style={!errors["future_advertisments"]?.[ind] ? { stroke: "lime", opacity: 0.6 } : {}} />
                  ) : null}
                </Flex>
                <Flex gap="sm" wrap="wrap">
                  {sortSnakeGenes(s?.genes as any)?.map((a) => <GenePill item={a} key={`${a.label}_${a.id}`} size="xs" />)}
                </Flex>
                <Divider mb="md" />
              </Stack>
            );
          })}
        </div>
      ) : null}
      <Flex align="flex-start" maw="100%" gap="xl">
        <Button ml="auto" size="compact-xs" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isDis || isCrPend || isPending} disabled={isDis || isCrPend || isPending}>
          Разместить
        </Button>
      </Flex>
      <Modal
        styles={{
          content: { overflow: "visible" },
        }}
        centered
        opened={sigItemIndex.value != null}
        onClose={() => {
          lastIndex.current = {
            ...lastIndex.current,
            [String(sigItemIndex.value)]: true,
          };
          trigger("future_advertisments");
          sigItemIndex.value = undefined;
        }}
        size="sm"
        title={<Title order={5}>{trg?.snake_name}</Title>}
        keepMounted={false}
      >
        <FormProvider {...innerInstance}>
          <SIndividModal picture={trg?.picture} />
        </FormProvider>
      </Modal>
    </Drawer>
  );
};

const SIndividModal = ({ picture }) => {
  const [imgs, setImgs] = useState<string[] | undefined>([]);
  const resetRef = useRef<() => void>(null);
  const { resetField, control, setValue, getValues, trigger } = useFormContext<any>();
  const { data: base64 } = useBase64(picture, picture != null);

  useLayoutEffect(() => {
    if (picture != null) {
      setImgs([picture]);
    }
  }, [picture]);

  useEffect(() => {
    if (base64 != null) {
      resetField(`future_advertisments.${sigItemIndex.value}.pictures`, {
        defaultValue: [base64],
      });
    }
  }, [base64, resetField]);

  const blob = getValues(`future_advertisments.${sigItemIndex.value}.pictures`);

  useEffect(() => {
    const someFunc = async (payload) => {
      const kek = await Promise.all(payload?.map(async (a) => await compressNoHandlers(a)));
      setImgs(kek);
    };
    if (!isEmpty(blob)) {
      someFunc(blob);
    }
  }, [blob]);

  return (
    <Stack gap="xs">
      <Flex align="flex-start" maw="100%">
        <Controller
          name={`future_advertisments.${sigItemIndex.value}.pictures` as any}
          control={control}
          render={({ field: { onChange }, fieldState: { error } }) => {
            return (
              <FileUploadMulti
                ref={resetRef}
                size="xs"
                clearFile={(index) => {
                  setImgs((s) => {
                    const pre = s?.filter((b, ind) => ind !== index);
                    if (isEmpty(pre)) {
                      resetRef.current?.();
                      onChange(null);
                      setValue(`future_advertisments.${sigItemIndex.value}.pictures`, null as any, { shouldDirty: true });
                      return undefined;
                    }
                    const filteredField = getValues(`future_advertisments.${sigItemIndex.value}.pictures`).filter((b, ind) => ind !== index);
                    setValue(`future_advertisments.${sigItemIndex.value}.pictures`, filteredField, { shouldDirty: true });
                    return pre;
                  });
                }}
                clearAll={() => {
                  setImgs(undefined);
                  resetRef.current?.();
                  setValue(`future_advertisments.${sigItemIndex.value}.pictures`, null as any, { shouldDirty: true });
                  onChange(null);
                }}
                onUpload={(files) => files?.forEach(async (a) => await compressMulti(a, (b) => onChange([...(getValues(`future_advertisments.${sigItemIndex.value}.pictures`) ?? []), b]), setImgs))}
                url={imgs?.filter((a) => a) || null}
                err={error?.message}
              />
            );
          }}
        />
      </Flex>
      <Controller
        name={`future_advertisments.${sigItemIndex.value}.sale_price` as any}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <NumberInput
              required
              rightSection="₽"
              label="Цена продажи"
              flex="1 1 50%"
              hideControls
              thousandSeparator=" "
              onBlur={() => trigger(`future_advertisments.${sigItemIndex.value}.sale_price` as any)}
              error={error?.message}
              value={value}
              onChange={onChange}
              allowDecimal={false}
              allowLeadingZeros={false}
              allowNegative={false}
            />
          );
        }}
      />
      <Controller
        name={`future_advertisments.${sigItemIndex.value}.adv_status` as any}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <Select
              allowDeselect={false}
              required
              data={adStatsHardcode}
              value={value}
              onChange={onChange}
              onBlur={() => trigger(`future_advertisments.${sigItemIndex.value}.adv_status` as any)}
              label={"Статус"}
              error={error?.message}
              size="sm"
              flex="1 1 50%"
            />
          );
        }}
      />
      <Controller
        name={`future_advertisments.${sigItemIndex.value}.discount_price` as any}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <NumberInput
              onBlur={() => trigger(`future_advertisments.${sigItemIndex.value}.discount_price` as any)}
              rightSection="₽"
              label="Цена со скидкой"
              hideControls
              thousandSeparator=" "
              error={error?.message}
              value={value}
              onChange={onChange}
              allowDecimal={false}
              allowLeadingZeros={false}
              allowNegative={false}
              flex="1 1 50%"
            />
          );
        }}
      />
      <Controller
        name={`future_advertisments.${sigItemIndex.value}.discount_until` as any}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <>
              <DateInput label="Скидка действует до" placeholder="Бессрочно" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" error={error?.message} flex="1 1 50%" />
            </>
          );
        }}
      />
      <Controller
        name={`future_advertisments.${sigItemIndex.value}.description` as any}
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
              onBlur={() => trigger(`future_advertisments.${sigItemIndex.value}.description` as any)}
              value={value}
              error={error?.message}
              autosize
              styles={{ wrapper: { height: "100%" }, input: { height: 120 } }}
            />
          );
        }}
      />
    </Stack>
  );
};

const SContactsModal = () => {
  const { control, setValue, getValues, trigger } = useFormContext<any>();
  const { errors } = useFormState({
    name: "city_code" as const,
  });

  const [val, setVal] = useState("");
  const { mutate: search, data, isPending } = useDadata();

  const errs = errors?.city_code;
  const debSearch = debounce(setVal, 400);

  useEffect(() => {
    if (val.length > 1) {
      search(val);
    }
  }, [val, search]);

  return (
    <>
      {!getValues("city_code") || (!getValues("contacts_group") && !getValues("contacts_telegram")) ? (
        <Alert variant="light" color="blue" title="VK группа и/или Телега, Город">
          <Text size="sm" fs="italic">
            Заполните эти данные один раз в разделе Контакты в Аккаунте (Профиле), они будут автоматически подтягиваться в каждую форму объявления и данная подсказка больше не будет отображаться
          </Text>
        </Alert>
      ) : null}
      <Flex align="flex-start" maw="100%" gap="md">
        <Box>
          <Autocomp
            label="Город"
            required
            data={data}
            onChange={debSearch}
            onOptionSubmit={(a) => {
              setValue("city_code", a.city_code);
              setValue("city_name", a.city_name);
              trigger("city_code");
            }}
            value={val || getValues("city_name")}
            isPending={isPending}
            error={errs?.message}
          />
        </Box>
        <Controller
          name="contacts_group"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput size="sm" label="Группа в VK" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} />;
          }}
        />
      </Flex>
      <Flex align="flex-start" maw="100%" gap="md">
        <Controller
          name="contacts_telegram"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput size="sm" label="Ник в Телеге" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} placeholder="юзернейм" />;
          }}
        />
        <Controller
          name="contacts_website"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput size="sm" label="Web-site" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} />;
          }}
        />
      </Flex>
    </>
  );
};
