import { Fragment } from "preact/jsx-runtime";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Checkbox, Flex, NumberInput, RangeSlider, Space, Stack } from "@mantine/core";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ESupabase, IReqCreateViv } from "@/api/common";
import { useSupaCreate } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { IVivScheme, defEnd, defStart, defVals, dummy, prepForCreate } from "./const";

export const FormAddVivarium = () => {
  const { mutate, isPending } = useSupaCreate<IReqCreateViv>(ESupabase.VIV);

  const { handleSubmit, register, control, setValue } = useForm<IVivScheme>({
    defaultValues: defVals,
    resolver: yupResolver(dummy as any),
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

  const onSub = (sub: IVivScheme) => {
    mutate(prepForCreate(sub), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Виварий задан" });
      },
      onError: (err) => {
        notif({ c: "red", m: err.message });
      },
    });
  };

  return (
    <Stack maw="100%" w="100%">
      <Flex rowGap="lg" columnGap="md" wrap="nowrap" maw="100%" w="100%">
        <Checkbox label="Крысы" value="true" {...(register("isRats") as any)} />
      </Flex>
      {wIsRats ? (
        <>
          <Space h="sm" />
          {fieldsRats.map((row, ind) => (
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
                  min={ind === 0 ? defStart : (wRats?.[ind - 1]?.range[1] ?? 0) + 1}
                  max={ind === 0 ? defEnd : (wRats?.[ind - 1]?.range[1] ?? 0) + 40}
                />
                <NumberInput size="xs" onChange={(a) => setValue(`rats_range.${ind}.quant`, Number(a))} value={wRats?.[ind]?.quant} suffix=" шт" hideControls allowNegative={false} allowDecimal={false} allowLeadingZeros={false} flex="1 1 25%" />
                {ind === 0 ? null : (
                  <Flex p="4px" style={{ cursor: "pointer" }} onClick={() => removeRats(ind)} align="center" justify="center">
                    <IconSwitch icon="bin" width="24" height="24" style={{ opacity: 0.6, stroke: "red" }} />
                  </Flex>
                )}
              </Flex>
              <Button variant="default" size="compact-xs" onClick={() => appendRats({ range: [(wRats?.[wRats.length - 1]?.range[1] ?? 0) + 1, (wRats?.[wRats.length - 1]?.range[1] ?? 0) + 20], quant: 0 })} style={{ alignSelf: "end" }}>
                Ещё граммовка
              </Button>
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
          {fieldsMice.map((row, ind) => (
            <Fragment key={row.id}>
              <Flex maw="100%" w="100%" columnGap="md" rowGap="xl" align="center">
                <RangeSlider
                  onChange={(a) => setValue(`mice_range.${ind}.range`, a)}
                  value={(wMice?.[ind]?.range ?? wMice?.[ind - 1]?.range) as any}
                  color="blue"
                  labelAlwaysOn
                  label={(a) => `${a} г`}
                  minRange={5}
                  maw="100%"
                  flex="1 1 65%"
                  min={ind === 0 ? defStart : (wMice?.[ind - 1]?.range[1] ?? 0) + 1}
                  max={ind === 0 ? defEnd : (wMice?.[ind - 1]?.range[1] ?? 0) + 40}
                />
                <NumberInput size="xs" onChange={(a) => setValue(`mice_range.${ind}.quant`, Number(a))} value={wMice?.[ind]?.quant} suffix=" шт" hideControls allowNegative={false} allowDecimal={false} allowLeadingZeros={false} flex="1 1 25%" />
                {ind === 0 ? null : (
                  <Flex p="4px" style={{ cursor: "pointer" }} onClick={() => removeMice(ind)} align="center" justify="center">
                    <IconSwitch icon="bin" width="24" height="24" style={{ opacity: 0.6, stroke: "red" }} />
                  </Flex>
                )}
              </Flex>
              <Button variant="default" size="compact-xs" onClick={() => appendMice({ range: [(wMice?.[wMice.length - 1]?.range[1] ?? 0) + 1, (wMice?.[wMice.length - 1]?.range[1] ?? 0) + 20], quant: 0 })} style={{ alignSelf: "end" }}>
                Ещё граммовка
              </Button>
            </Fragment>
          ))}
        </>
      ) : null}

      <Space h="sm" />
      <Button size="compact-xs" onClick={handleSubmit(onSub)} style={{ alignSelf: "end" }} loading={isPending} disabled={!wIsRats && !wIsMice}>
        Создать
      </Button>
    </Stack>
  );
};
