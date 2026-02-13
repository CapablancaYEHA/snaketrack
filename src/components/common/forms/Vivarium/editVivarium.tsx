import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Checkbox, Flex, NumberInput, RangeSlider, Space, Text } from "@mantine/core";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ESupabase, IReqUpdViv } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { IVivScheme, composeInit, defEndMice, defEndRats, defStartMice, defStartRats, prepForUpdate, stepMice, stepRats, vivScheme } from "./const";

export const FormEditVivarium = ({ viv, initRat, initMouse }) => {
  const location = useLocation();
  const { mutate: updViv, isPending } = useSupaUpd<IReqUpdViv>(ESupabase.VIV);
  const {
    handleSubmit,
    register,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IVivScheme>({
    defaultValues: {},
    resolver: yupResolver(vivScheme),
  });

  const {
    fields: fieldsRats,
    append: appendRats,
    remove: removeRats,
  } = useFieldArray<any, any, "id" | "range" | "quant">({
    control,
    name: "rats_range",
  });

  const {
    fields: fieldsMice,
    append: appendMice,
    remove: removeMice,
  } = useFieldArray<any, any, "id" | "range" | "quant">({
    control,
    name: "mice_range",
  });

  const [wRats, wMice, wIsRats, wIsMice] = useWatch({ control, name: ["rats_range", "mice_range", "isRats", "isMice"] });
  const isDirtyRats = JSON.stringify(initRat) !== JSON.stringify(wRats);
  const isDirtyMice = JSON.stringify(initMouse) !== JSON.stringify(wMice);

  const onSub = (sbm: IVivScheme) => {
    updViv(
      {
        id: viv.id,
        upd: prepForUpdate(sbm, isDirtyRats, isDirtyMice),
      },
      {
        onSuccess: () => {
          notif({ c: "teal", t: "Успешно", m: "Виварий отредактирован" });
          location.route("/vivarium");
        },
        onError: (e) => {
          notif({ c: "red", t: "Редактирование не удалось", m: e.message, code: e.code });
        },
      },
    );
  };

  useEffect(() => {
    reset(composeInit(viv));
  }, [reset, viv]);

  return (
    <>
      <Text size="md" fw={500} c="yellow.6">
        Редактирование Вивариума
      </Text>
      <Flex rowGap="lg" columnGap="md" wrap="nowrap" maw="100%" w="100%">
        <Checkbox label="Крысы" value="true" {...(register("isRats") as any)} />
      </Flex>
      {wIsRats ? (
        <>
          <Space h="sm" />
          {fieldsRats.map((row, ind, self) => (
            <Fragment key={row.id}>
              <Flex maw="100%" w="100%" columnGap="md" rowGap="xl" align="center">
                <RangeSlider
                  onChange={(a) => setValue(`rats_range.${ind}.range`, a)}
                  value={(wRats?.[ind]?.range ?? wRats?.[ind - 1]?.range) as any}
                  color="blue"
                  labelAlwaysOn
                  label={(a) => `${a} г`}
                  minRange={5}
                  maw="100%"
                  flex="1 1 65%"
                  min={ind === 0 ? defStartRats : (wRats?.[ind - 1]?.range[1] ?? 0) + 1}
                  max={ind === 0 ? defEndRats : (wRats?.[ind - 1]?.range[1] ?? 0) + stepRats}
                />
                <NumberInput size="xs" onChange={(a) => setValue(`rats_range.${ind}.quant`, Number(a))} value={wRats?.[ind]?.quant} suffix=" шт" hideControls allowNegative={false} allowDecimal={false} allowLeadingZeros={false} flex="1 1 25%" />
                {ind === 0 ? (
                  <Flex flex="0 0 32px" />
                ) : (
                  <Flex p="4px" style={{ cursor: "pointer" }} onClick={() => removeRats(ind)} align="center" justify="center">
                    <IconSwitch icon="bin" width="24" height="24" style={{ opacity: 0.6, stroke: "red" }} />
                  </Flex>
                )}
              </Flex>
              {errors?.rats_range?.[ind]?.message ? (
                <Text size="xs" c="var(--mantine-color-error)">
                  {errors?.rats_range?.[ind]?.message}
                </Text>
              ) : null}
              {ind === self.length - 1 ? (
                <Button variant="default" size="compact-xs" onClick={() => appendRats({ range: [(wRats?.[wRats.length - 1]?.range[1] ?? 0) + 1, (wRats?.[wRats.length - 1]?.range[1] ?? 0) + stepRats], quant: 0 })} style={{ alignSelf: "end" }}>
                  Ещё граммовка
                </Button>
              ) : null}
            </Fragment>
          ))}
        </>
      ) : null}

      <Flex rowGap="lg" columnGap="md" wrap="nowrap" maw="100%" w="100%">
        <Checkbox label="Мыши" value="true" {...register("isMice")} />
      </Flex>
      {wIsMice ? (
        <>
          <Space h="sm" />
          {fieldsMice.map((row, ind, self) => (
            <Fragment key={row.id}>
              <Flex maw="100%" w="100%" columnGap="md" rowGap="xl" align="center">
                <RangeSlider
                  onChange={(a) => setValue(`mice_range.${ind}.range`, a)}
                  value={(wMice?.[ind]?.range ?? wMice?.[ind - 1]?.range) as any}
                  color="blue"
                  labelAlwaysOn
                  label={(a) => `${a} г`}
                  minRange={1}
                  maw="100%"
                  flex="1 1 65%"
                  min={ind === 0 ? defStartMice : (wMice?.[ind - 1]?.range[1] ?? 0) + 1}
                  max={ind === 0 ? defEndMice : (wMice?.[ind - 1]?.range[1] ?? 0) + stepMice}
                />
                <NumberInput size="xs" onChange={(a) => setValue(`mice_range.${ind}.quant`, Number(a))} value={wMice?.[ind]?.quant} suffix=" шт" hideControls allowNegative={false} allowDecimal={false} allowLeadingZeros={false} flex="1 1 25%" />
                {ind === 0 ? (
                  <Flex flex="0 0 32px" />
                ) : (
                  <Flex p="4px" style={{ cursor: "pointer" }} onClick={() => removeMice(ind)} align="center" justify="center">
                    <IconSwitch icon="bin" width="24" height="24" style={{ opacity: 0.6, stroke: "red" }} />
                  </Flex>
                )}
              </Flex>
              {errors?.mice_range?.[ind]?.message ? (
                <Text size="xs" c="var(--mantine-color-error)">
                  {errors?.mice_range?.[ind]?.message}
                </Text>
              ) : null}
              {ind === self.length - 1 ? (
                <Button variant="default" size="compact-xs" onClick={() => appendMice({ range: [(wMice?.[wMice.length - 1]?.range[1] ?? 0) + 1, (wMice?.[wMice.length - 1]?.range[1] ?? 0) + stepMice], quant: 0 })} style={{ alignSelf: "end" }}>
                  Ещё граммовка
                </Button>
              ) : null}
            </Fragment>
          ))}
        </>
      ) : null}

      <Space h="sm" />
      <Flex align="flex-start" maw="100%" w="100%" gap="xl">
        <Button size="compact-xs" ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} loading={isPending} disabled={(!isDirtyRats && !isDirtyMice) || isPending}>
          Сохранить
        </Button>
      </Flex>
    </>
  );
};
