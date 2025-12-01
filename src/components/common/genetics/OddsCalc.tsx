import { FC } from "preact/compat";
import { useEffect } from "preact/hooks";
import { Box, Flex, Loader, Space, Stack, Text } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { prepForMm } from "@/components/ballpythons/forms/bpBreed/common";
import { useCalcMmOdds } from "@/api/ballpythons/misc";
import { IMMOff } from "@/api/ballpythons/models";
import { ECategories } from "@/api/common";
import { notif } from "@/utils/notif";
import { emptyMMTrait, fromMMtoPill } from "./const";
import { GenePill, GenesSelect } from "./geneSelect";

interface IProp {
  category: ECategories;
}
export const OddsCalc: FC<IProp> = ({ category }) => {
  const innerInstance = useFormContext<any>();

  const [wOne, wTwo] = useWatch({
    control: innerInstance.control,
    name: ["parentOne", "parentTwo"],
  });
  const { mutate, data, isPending } = useCalcMmOdds(category);

  useEffect(() => {
    if (!isEmpty(wOne) && !isEmpty(wTwo)) {
      mutate(
        { p1: prepForMm({ genes: wOne } as any), p2: prepForMm({ genes: wTwo } as any) },
        {
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
    }
  }, [wOne, wTwo, mutate]);

  return (
    <>
      <Flex direction="row" wrap="nowrap" gap="xs" w="100%" key={category}>
        <Controller
          name="parentOne"
          control={innerInstance.control}
          render={({ field: { onChange } }) => {
            return <GenesSelect onChange={(a) => onChange(a)} category={category} label="Родитель 1" description=" " />;
          }}
        />
        <Controller
          name="parentTwo"
          control={innerInstance.control}
          render={({ field: { onChange } }) => {
            return <GenesSelect onChange={(a) => onChange(a)} category={category} label="Родитель 2" description=" " />;
          }}
        />
      </Flex>

      <Stack gap="lg" pt="xs" w="100%">
        {isPending ? (
          <>
            <Space h="md" />
            <Loader size="md" style={{ alignSelf: "center" }} />
          </>
        ) : null}
        {!isEmpty(wOne) && !isEmpty(wTwo)
          ? data?.offspring?.map((o) => {
              return <OddsElement o={o} key={o.morph_name} />;
            })
          : null}
      </Stack>
    </>
  );
};
type IPropOdds = {
  o: IMMOff;
};
export const OddsElement: FC<IPropOdds> = ({ o }) => {
  const { numerator, denominator } = o.probability;
  const isPureNormal = o.traits_count === 0 || isEmpty(o.traits);
  const special = (o.traits ?? [])
    .reduce((tot, cur) => `${tot}${cur.name} `, "")
    .trim()
    .split(" ")
    .sort()
    .join(" ");

  return (
    <Flex direction="row" wrap="nowrap" gap="md" w="100%" maw="100%">
      <Box fz="xs" flex="0 0 72px" component="section">{`${numerator}/${denominator} (${(numerator / denominator) * 100}%)`}</Box>
      <Flex direction="row" wrap="wrap" gap="sm">
        {isPureNormal ? <GenePill item={emptyMMTrait as any} /> : o.traits.map((t) => <GenePill key={`${t.id}_${t.name}`} item={fromMMtoPill(t)} />)}
      </Flex>
      {isPureNormal ? null : special.includes(o.morph_name.split(" ").sort().join(" ")) ? null : (
        <Flex gap="xs">
          <Text style={{ alignSelf: "center" }}>=</Text>
          <GenePill item={{ label: o.morph_name, gene: "combo" } as any} withWrap />
        </Flex>
      )}
    </Flex>
  );
};
