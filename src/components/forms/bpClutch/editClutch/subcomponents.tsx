import fallback from "@assets/placeholder.png";
import { Box, Flex, Image, Loader, Modal, Progress, Space, Stack, Text, Title } from "@mantine/core";
import { calcProjGenes } from "@/components/ballpythons/const";
import { SexName } from "@/components/common/sexName";
import { sortBpGenes } from "@/components/genetics/const";
import { GenePill } from "@/components/genetics/geneSelect";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useSnake } from "@/api/hooks";
import { IResBpClutch } from "@/api/models";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff, getAge, getDate } from "@/utils/time";
import { getPercentage } from "../../bpBreed/breedUtils";

export const SCard = ({ clutch, onPicClick, className }: { clutch: IResBpClutch; onPicClick: Function; className?: string }) => {
  const pics = [clutch.female_picture].concat(clutch.male_pictures);
  const ids = [clutch.female_id].concat(clutch.males_ids);
  const left = dateTimeDiff(dateAddDays(clutch.date_laid, 60), "days");
  return (
    <Flex gap="xl" flex="1 1 auto" className={className} mih={324}>
      <Stack gap="md" justify="space-between">
        {pics.map((a, ind) => (
          <Flex
            key={a}
            mt={ind === 1 ? "lg" : 0}
            gap="sm"
            align="center"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              onPicClick(ids[ind], ind === 0 ? "Самка" : "Самец");
            }}
          >
            <IconSwitch icon={ind === 0 ? "female" : "male"} width="16" height="16" />
            <Image src={a} fit="cover" radius="sm" w="auto" h={64} loading="lazy" flex="1 1 64px" fallbackSrc={fallback} />
          </Flex>
        ))}
      </Stack>
      <Stack gap="md" flex="0 1 40%">
        <Flex gap="lg" justify="space-between">
          <Title order={6}>
            Дата кладки
            <Text size="sm" fw={500}>
              {getDate(clutch.date_laid)}
            </Text>
          </Title>
          <Title order={6}>
            Ожидаем
            <Text size="sm" fw={500}>
              ~{getDate(dateAddDays(clutch.date_laid, 60))}
            </Text>
          </Title>
        </Flex>
        <Flex>
          <Box w="100%" maw="100%">
            <Progress.Root size="lg">
              <Progress.Section value={getPercentage(60, left)} color="green" animated striped />
            </Progress.Root>
          </Box>
        </Flex>
        <Flex justify="center">
          <Title order={6}>Осталось ~{declWord(left, ["день", "дня", "дней"])}</Title>
        </Flex>
        <Space h="lg" />
        <Flex gap="lg">
          <Stack gap="xs">
            <Title order={6}>
              Яйца
              <Text size="sm" fw={500}>
                {clutch.eggs || "Не указано"}
              </Text>
            </Title>
          </Stack>
          <Stack gap="xs">
            <Title order={6}>
              Жировики
              <Text size="sm" fw={500}>
                {clutch.slugs || "Не указано"}
              </Text>
            </Title>
          </Stack>
        </Flex>
        <Title order={6}>Гены в проекте</Title>
        <Flex gap="4px" wrap="wrap">
          {calcProjGenes(clutch.female_genes.concat(clutch.male_genes.flat())).map((a, ind) => (
            <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="xs" />
          ))}
        </Flex>
      </Stack>
    </Flex>
  );
};

export const MiniInfo = ({ opened, close, selectedSnake }) => {
  const { data, isPending, isError } = useSnake(selectedSnake.id, selectedSnake.id != null);

  return (
    <Modal centered opened={opened} onClose={close} size="xs" mih={260} title={<Title order={4}>{selectedSnake.sex || ""} в кладке</Title>}>
      <Stack gap="md">
        {isPending ? (
          <Loader color="dark.1" size="lg" style={{ alignSelf: "center" }} />
        ) : isError ? (
          <Text fw={500} c="var(--mantine-color-error)">
            Не удалось подгрузить данные
          </Text>
        ) : (
          <>
            <Image src={data?.picture ?? fallback} flex="1 1 0px" fit="cover" radius="md" w="auto" maw="100%" mih={110} fallbackSrc={fallback} loading="lazy" />
            <SexName sex={data?.sex} name={data?.snake_name} />
            <Text size="md">⌛ {getAge(data?.date_hatch)}</Text>
            <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
              {sortBpGenes(data.genes as any).map((a) => (
                <GenePill item={a} key={`${a.label}_${a.id}`} />
              ))}
            </Flex>
          </>
        )}
      </Stack>
    </Modal>
  );
};
