import { useState } from "preact/hooks";
import { Flex, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { BpList } from "@/components/ballpythons/BpList";
import { BcList } from "@/components/boa-constrictors/BcList";
import { ECategories } from "@/api/common";

export function SnakeCategories() {
  const vis = localStorage.getItem("SNAKES_VISITED");
  const [val, setVal] = useState(vis ?? "");

  const handle = (a) => {
    localStorage.setItem("SNAKES_VISITED", a);
    setVal(a);
  };

  return (
    <Stack align="center" justify="flex-start" gap="md" component="section">
      <Flex wrap="nowrap" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          Змеи
        </Title>
      </Flex>
      <SegmentedControl
        value={val}
        onChange={handle}
        w="100%"
        maw="320px"
        data={[
          {
            label: "Региусы",
            value: ECategories.BP,
          },
          {
            label: "Удавы",
            value: ECategories.BC,
          },
        ]}
      />
      {vis === ECategories.BP ? (
        <BpList />
      ) : vis === ECategories.BC ? (
        <BcList />
      ) : (
        <Text fw={500} component="span">
          Перейдите в категорию для просмотра коллекции
        </Text>
      )}
    </Stack>
  );
}
