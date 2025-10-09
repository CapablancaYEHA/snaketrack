import { Flex, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { SnakeCollectionList, catVisited } from "@/components/common/SnakeCollectionList";
import { ECategories } from "@/api/common";

export function SnakeCategories() {
  const vis = localStorage.getItem("SNAKES_VISITED");
  catVisited.value = vis ?? ("" as any);

  const handle = (a) => {
    catVisited.value = a;
    localStorage.setItem("SNAKES_VISITED", a);
  };

  return (
    <Stack align="center" justify="flex-start" gap="md" component="section">
      <Flex wrap="nowrap" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          Змеи
        </Title>
      </Flex>
      <SegmentedControl
        size="xs"
        value={catVisited.value}
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
          {
            label: "Маисы",
            value: ECategories.CS,
          },
        ]}
      />
      {catVisited.value ? (
        <SnakeCollectionList />
      ) : (
        <Text fw={500} component="span">
          Перейдите в категорию для просмотра коллекции
        </Text>
      )}
    </Stack>
  );
}
