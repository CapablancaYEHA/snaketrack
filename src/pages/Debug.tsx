import { Fragment } from "preact/compat";
import { Flex, LoadingOverlay, Stack, Text } from "@mantine/core";
import md5 from "crypto-js/md5";
import { ESupaBreed, IGenesComp, categoryToShort } from "@/api/common";
import { useSupaGet } from "@/api/hooks";
import { getDate, getDateObj } from "@/utils/time";

const prep = (g: IGenesComp[]) => {
  return g
    ?.map((a) => {
      if (a.isPos) return `Pos ${a.label}`;
      return a.label;
    })
    .sort()
    .join(" ")
    .trim();
};

export const calculateHash = (v) => md5(prep(v)).toString();

export function Debug() {
  //   const { data, isFetching, isError } = useSupaGet<any>({ t: "ballpythons" as any, f: (b) => b.contains("genes", '[{"label":"210 Hypo"}]'), id: "Hypo" }, true);
  const { data, isPending, isError, isFetching } = useSupaGet<any[]>({ t: ESupaBreed[`${categoryToShort["ball-pythons"].toUpperCase()}_BREED_V`], f: (b) => b.filter("male_ids", "cs", `{115f895031}`), id: "115f895031" }, true);

  if (isFetching) return <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />;

  if (isError)
    return (
      <Text fw={500} c="var(--mantine-color-error)">
        Произошла ошибка запроса
      </Text>
    );

  const maleData = data.map((a) => {
    const events = a.males_events["115f895031"].sort((c, d) => getDateObj(d.date) - getDateObj(c.date));
    return { samka: a.female_name, events };
  });

  console.log("sorting", maleData);

  return (
    <div>
      <Stack>
        {maleData.map((a) => (
          <Fragment key={a.samka}>
            <span>для самки {a.samka}</span>
            {a.events.map((e) => (
              <Fragment key={e.date}>
                <Flex gap="xs">
                  <span>{getDate(e.date)}</span>
                  <span>{e.event}</span>
                </Flex>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </Stack>
    </div>
  );
}
