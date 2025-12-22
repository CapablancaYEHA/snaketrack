import { startMd, startSm } from "@/styles/theme";
import fallback from "@assets/placeholder.png";
import { Anchor, Box, Flex, Grid, Group, Image, Loader, Modal, Progress, Select, SimpleGrid, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { isEmpty } from "lodash-es";
import { Controller, useFormContext } from "react-hook-form";
import { sortSnakeGenes } from "@/components/common/genetics/const";
import { GenePill, GenesSelect } from "@/components/common/genetics/geneSelect";
import { SexName } from "@/components/common/sexName";
import { calcProjGenes, categToConfigList } from "@/components/common/utils";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { EClSt, IResClutch } from "@/api/breeding/models";
import { ECategories, EGenesView, IResSnakesList } from "@/api/common";
import { useSupaGet } from "@/api/hooks";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff, getAge, getDate, getDateObj } from "@/utils/time";
import { daysIncubation, getPercentage } from "../snakeBreed/breedUtils";
import { sexHardcode } from "../snakeBreed/common";
import { calcAnim } from "./clutchUtils";
import { IClutchEditScheme, statusHardcode } from "./common";

export const SPics = ({ clutch, onPicClick, className }: { clutch: IResClutch; onPicClick: Function; className?: string }) => {
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
              key={`${a}_${ind}_${clutch.id}`}
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
      </Flex>
    </Stack>
  );
};

export const SInfo = ({ clutch, onPicClick, category }: { clutch: IResClutch; onPicClick: Function; category: ECategories }) => {
  const ids = clutch.finalised_ids;

  return (
    <Flex gap="xl" flex="0 1 520px">
      <Stack gap="md" flex={ids ? "1 0 290px" : "1 1 auto"}>
        <ClutchProgress laidDate={clutch.date_laid} hatchDate={clutch.date_hatch} curStatus={clutch.status} category={category} />
        <Space h="lg" />
        <Flex gap="xl" wrap="nowrap">
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
      {ids ? <Juveniles ids={ids} onPicClick={onPicClick} /> : null}
    </Flex>
  );
};

export const Juveniles = ({ ids, onPicClick, title = "Змееныши" }) => {
  return (
    <Flex wrap="nowrap" direction="column" align="flex-start">
      <div>
        <Title order={6}>{title}</Title>
        <Space h="xs" />
      </div>
      <Flex gap="md" wrap="wrap" direction="column" mah={344}>
        {ids?.map((a, ind) => (
          <Flex
            key={a}
            gap="sm"
            align="center"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              onPicClick(ids[ind], null);
            }}
          >
            <IconSwitch icon={""} width="16" height="16" />
            <Image src={fallback} fit="cover" radius="sm" w="auto" h={32} loading="lazy" flex="1 1 32px" fallbackSrc={fallback} />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export const ClutchProgress = ({ laidDate, hatchDate, curStatus, category, barOnly = false }) => {
  const left = dateTimeDiff(dateAddDays(laidDate, daysIncubation[category]), "days");
  const isHatch = curStatus === EClSt.HA;
  const isClosed = curStatus === EClSt.CL;

  return (
    <>
      {barOnly ? null : (
        <Flex gap="sm" justify="space-between">
          <Title order={6}>
            Дата кладки
            <Text size="sm" fw={500}>
              {getDate(laidDate)}
            </Text>
          </Title>
          {(isHatch || isClosed) && hatchDate ? (
            <Title order={6} ta="right">
              Кладка инкубирована
              <Text size="sm" fw={500}>
                {getDate(hatchDate)}
              </Text>
            </Title>
          ) : (
            <Title order={6} ta="right">
              Ожидаем
              <Text size="sm" fw={500}>
                ~{getDate(dateAddDays(laidDate, daysIncubation[category]))}
              </Text>
            </Title>
          )}
        </Flex>
      )}
      <Flex>
        <Box w="100%" maw="100%">
          <Progress.Root size="lg">
            <Progress.Section value={getPercentage(daysIncubation[category], left)} color="green" animated={calcAnim(curStatus, left)} striped={calcAnim(curStatus, left)} />
          </Progress.Root>
        </Box>
      </Flex>
      <Flex justify="center">
        <Title order={6}>До конца инкубации ~{declWord(left, ["день", "дня", "дней"])}</Title>
      </Flex>
    </>
  );
};

export const MiniInfo = ({ opened, close, snakeId, sex, category, withTitle = true }) => {
  const { data, isPending, isError } = useSupaGet<IResSnakesList>(categToConfigList[category](snakeId), snakeId != null);
  const lastWeight = data?.weight?.sort((a, b) => getDateObj(a.date) - getDateObj(b.date))?.[data?.weight.length - 1];

  return (
    <Modal centered opened={opened} onClose={close} size="xs" title={withTitle && sex ? <Title order={4}>{sex} в кладке</Title> : undefined}>
      <Stack gap="md" mih={260}>
        {isPending ? (
          <Loader color="dark.1" size="lg" style={{ alignSelf: "center" }} />
        ) : isError ? (
          <Text fw={500} c="var(--mantine-color-error)">
            Не удалось подгрузить данные
          </Text>
        ) : (
          <>
            <Image src={data?.picture ?? fallback} flex="1 1 0px" fit="cover" radius="md" w="auto" maw="100%" mih={110} mah={112} fallbackSrc={fallback} loading="lazy" />
            <Anchor href={`/snakes/${category}?id=${data.id}`} c="inherit">
              <SexName sex={data?.sex} name={data?.snake_name} isLink />
            </Anchor>
            <Text size="md">⌛ {getAge(data?.date_hatch)}</Text>
            {lastWeight ? <Text size="md">Вес {lastWeight.weight}г</Text> : null}
            <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
              {sortSnakeGenes(data.genes as any).map((a) => (
                <GenePill item={a} key={`${a.label}_${a.id}`} />
              ))}
            </Flex>
          </>
        )}
      </Stack>
    </Modal>
  );
};

export const FormApprovedBabies = ({ futureSnakes, isShow }) => {
  const isMinSm = useMediaQuery(startSm);
  const isMinMd = useMediaQuery(startMd);
  const innerInstance = useFormContext<IClutchEditScheme>();

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
            return <GenesSelect view={EGenesView.STD} description={null} onChange={(a) => onChange(a)} label={ind === 0 ? "Морфы" : isLabel ? " " : undefined} init={value as any} placeholder="Необязательно" category={ECategories.BP} />;
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

  return !isEmpty(futureSnakes) && isShow ? (
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
