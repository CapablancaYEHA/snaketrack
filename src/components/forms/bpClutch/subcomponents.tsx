import { useEffect } from "preact/hooks";
import { mobileThreshold, startMd, startSm, tabletThreshold } from "@/styles/theme";
import fallback from "@assets/placeholder.png";
import { Box, Flex, Grid, Group, Image, Loader, Modal, Progress, Select, SimpleGrid, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { isEmpty } from "lodash-es";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { calcProjGenes } from "@/components/ballpythons/const";
import { SexName } from "@/components/common/sexName";
import { sortBpGenes } from "@/components/genetics/const";
import { GenePill, GeneSelect } from "@/components/genetics/geneSelect";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useGenes, useSnake } from "@/api/hooks";
import { EClSt, IResBpClutch } from "@/api/models";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff, getAge, getDate } from "@/utils/time";
import { getPercentage } from "../bpBreed/breedUtils";
import { sexHardcode } from "../bpBreed/common";
import { calcAnim } from "./clutchUtils";
import { IClutchScheme, statusHardcode } from "./editClutch/const";

export const SClutchCard = ({ clutch, onPicClick, className }: { clutch: IResBpClutch; onPicClick: Function; className?: string }) => {
  const pics = [clutch.female_picture].concat(clutch.male_pictures);
  const ids = [clutch.female_id].concat(clutch.males_ids);

  return (
    <Stack flex="1 1 auto">
      <Box>
        <Text size="sm" c="yellow.6">
          {clutch.id}
        </Text>
      </Box>
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
        <Stack gap="md" flex="1 1 auto">
          <ClutchProgress date_laid={clutch.date_laid} curStatus={clutch.status} />
          <Space h="lg" />
          <Flex gap="xl">
            <Stack gap="xs">
              <Title order={6}>
                Яйца
                <Text size="sm" fw={500}>
                  {clutch.eggs ?? "Не указано"}
                </Text>
              </Title>
            </Stack>
            <Stack gap="xs">
              <Title order={6}>
                Жировики
                <Text size="sm" fw={500}>
                  {clutch.slugs ?? "Не указано"}
                </Text>
              </Title>
            </Stack>
            <Stack gap="xs">
              <Title order={6}>
                Неоплоды
                <Text size="sm" fw={500}>
                  {clutch.infertile_eggs ?? "Не указано"}
                </Text>
              </Title>
            </Stack>
          </Flex>
          <Stack gap="xs">
            <Title order={6}>Гены в проекте</Title>
            <Flex gap="4px" wrap="wrap">
              {calcProjGenes(clutch.female_genes.concat(clutch.male_genes.flat())).map((a, ind) => (
                <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="xs" />
              ))}
            </Flex>
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
};

export const ClutchProgress = ({ date_laid, curStatus, barOnly = false }) => {
  const left = dateTimeDiff(dateAddDays(date_laid, 60), "days");

  return (
    <>
      {barOnly ? null : (
        <Flex gap="sm" justify="space-between">
          <Title order={6}>
            Дата кладки
            <Text size="sm" fw={500}>
              {getDate(date_laid)}
            </Text>
          </Title>
          <Title order={6} ta="right">
            Ожидаем
            <Text size="sm" fw={500}>
              ~{getDate(dateAddDays(date_laid, 60))}
            </Text>
          </Title>
        </Flex>
      )}
      <Flex>
        <Box w="100%" maw="100%">
          <Progress.Root size="lg">
            <Progress.Section value={getPercentage(60, left)} color="green" animated={calcAnim(curStatus, left)} striped={calcAnim(curStatus, left)} />
          </Progress.Root>
        </Box>
      </Flex>
      <Flex justify="center">
        <Title order={6}>До конца инкубации ~{declWord(left, ["день", "дня", "дней"])}</Title>
      </Flex>
    </>
  );
};

export const MiniInfo = ({ opened, close, snakeId, sex, withTitle = true }) => {
  const { data, isPending, isError } = useSnake(snakeId, snakeId != null);

  return (
    <Modal centered opened={opened} onClose={close} size="xs" title={withTitle ? <Title order={4}>{sex || ""} в кладке</Title> : undefined}>
      <Stack gap="md" mih={260}>
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

export const FormApprovedBabies = ({ futureSnakes }) => {
  const isMinSm = useMediaQuery(startSm);
  const isMinMd = useMediaQuery(startMd);
  const { data: traits } = useGenes();
  const innerInstance = useFormContext<IClutchScheme>();

  const { errors } = innerInstance.formState;

  const renderItems = (ind, isLabel) => (
    <>
      <TextInput {...innerInstance.register(`future_animals.${ind}.snake_name`)} required={ind === 0} label={ind === 0 ? "Кличка змеи" : isLabel ? " " : undefined} error={errors?.future_animals?.[ind]?.snake_name?.message} size="sm" />
      <Controller
        name={`future_animals.${ind}.date_hatch`}
        control={innerInstance.control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return <DatePickerInput label={ind === 0 ? "Дата рождения" : isLabel ? " " : undefined} value={new Date(value as any)} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" error={error?.message} maxDate={new Date()} size="sm" />;
        }}
      />
      <Controller
        name={`future_animals.${ind}.sex`}
        control={innerInstance.control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return <Select data={sexHardcode} value={value} onChange={onChange} label={ind === 0 ? "Пол" : isLabel ? " " : undefined} error={error?.message} size="sm" placeholder="Необязательно" />;
        }}
      />
      <Controller
        name={`future_animals.${ind}.status`}
        control={innerInstance.control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return <Select data={statusHardcode} value={value} onChange={onChange} label={ind === 0 ? "Состояние" : isLabel ? " " : undefined} error={error?.message} size="sm" />;
        }}
      />
      <Box>
        <Controller
          name={`future_animals.${ind}.genes`}
          control={innerInstance.control}
          render={({ field: { onChange, value } }) => {
            return <GeneSelect onChange={(a) => onChange(a)} outer={traits} label={ind === 0 ? "Морфы" : isLabel ? " " : undefined} init={value as any} placeholder="Необязательно" />;
          }}
        />
      </Box>
      <Box>
        <Text size="xs" c="var(--mantine-color-error)">
          {errors?.future_animals?.[ind]?.genes?.message || ""}
        </Text>
      </Box>
    </>
  );

  return !isEmpty(futureSnakes) ? (
    isMinMd ? (
      futureSnakes.map((f, ind) => (
        <SimpleGrid cols={5} spacing="xs" verticalSpacing="xs" key={f.id}>
          {renderItems(ind, false)}
        </SimpleGrid>
      ))
    ) : (
      <Grid gutter="sm">
        {futureSnakes.map((f, ind) => (
          <Grid.Col key={f.id} span={isMinSm ? 3 : 4}>
            <Group gap="sm" grow preventGrowOverflow>
              {renderItems(ind, true)}
            </Group>
          </Grid.Col>
        ))}
      </Grid>
    )
  ) : null;
};
