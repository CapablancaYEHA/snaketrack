import { useLocation } from "preact-iso";
import fallback from "@assets/placeholder.png";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Flex, Image, NumberInput, Progress, Stack, Text, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { signal } from "@preact/signals";
import { Controller, useForm, useWatch } from "react-hook-form";
import { calcProjGenes } from "@/components/ballpythons/const";
import { GenePill } from "@/components/genetics/geneSelect";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useUpdateBpClutch } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff } from "@/utils/time";
import { getPercentage } from "../../bpBreed/breedUtils";
import { MiniInfo } from "../subcomponents";
import { IClutchScheme, clutchSchema, prepForUpdate } from "./const";

const snakeId = signal<string | undefined>(undefined);

export const FormEditClutch = ({ initData }) => {
  const location = useLocation();
  const {
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    control,
    watch,
    getValues,
  } = useForm<IClutchScheme>({
    defaultValues: initData,
    resolver: yupResolver(clutchSchema as any),
  });

  const [wPics, wIds] = useWatch({
    control,
    name: ["pics", "ids"],
  });

  const { mutate: update } = useUpdateBpClutch();

  const dateLaid = watch("date_laid");
  const left = dateTimeDiff(dateAddDays(dateLaid, 60), "days");

  const onSub = async (sbm) => {
    update(prepForUpdate(sbm, dirtyFields, location.query.id), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Кладка обновлена" });
        location.route("/clutches");
      },
      onError: async (err) => {
        notif({
          c: "red",
          t: "Ошибка",
          m: JSON.stringify(err),
          code: err.code || err.statusCode,
        });
      },
    });
  };

  console.log("errors", errors);

  return (
    <>
      <Text size="md" fw={500} c="yellow.6">
        Просмотр и редактирование кладки {location.query.id}
      </Text>
      <Flex maw="100%" w="100%" gap="lg" wrap="wrap">
        {wPics?.map((a, ind) => (
          <Flex key={a} gap="sm" flex="0 1 160px" h={80} style={{ cursor: "pointer" }} onClick={() => (snakeId.value = wIds?.[ind])} wrap="nowrap">
            <IconSwitch icon={ind === 0 ? "female" : "male"} width="16" height="16" />
            <Image src={a} fit="cover" radius="sm" w="auto" flex="0 0 160px" loading="lazy" fallbackSrc={fallback} />
          </Flex>
        ))}
      </Flex>
      <Stack gap="xs">
        <Title order={6}>Гены в проекте</Title>
        <Flex gap="4px" wrap="wrap">
          {calcProjGenes((getValues("female_genes") as any).concat((getValues("male_genes") as any).flat())).map((a, ind) => (
            <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="xs" />
          ))}
        </Flex>
      </Stack>

      <Stack maw="100%" w="100%" gap="lg">
        <Flex maw="100%" w="100%" gap="xl" align="end" direction={{ base: "column", xs: "row" }}>
          <Controller
            name="date_laid"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <DatePickerInput label="Дата кладки" w={{ base: "100%", xs: "50%" }} flex="1 1 50%" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" error={error?.message} maxDate={new Date()} />;
            }}
          />
          <Stack w={{ base: "100%", xs: "50%" }} flex="1 1 50%">
            <Flex>
              <Box w="100%" maw="100%">
                <Progress.Root size="lg">
                  <Progress.Section value={getPercentage(60, left)} color="green" animated striped />
                </Progress.Root>
              </Box>
            </Flex>
            <Flex justify="center">
              <Title order={6}>До конца инкубации ~{declWord(left, ["день", "дня", "дней"])}</Title>
            </Flex>
          </Stack>
        </Flex>
        <Flex gap="lg" wrap="wrap">
          <Controller
            name="eggs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput label="Яйца" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} required allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
          <Controller
            name="slugs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput label="Жировики" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} required allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
          <Controller
            name="infertile_eggs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput label="Неоплоды" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
        </Flex>
      </Stack>

      <Flex align="flex-start" maw="100%" w="100%">
        {left <= 5 ? (
          <Button type="submit" onClick={() => undefined} variant="gradient" gradient={{ from: "violet", to: "orange", deg: 90 }} size="xs">
            Завершить инкубацию
          </Button>
        ) : null}
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} disabled={!isDirty}>
          Сохранить изменения
        </Btn>
      </Flex>
      <MiniInfo
        opened={snakeId.value != null}
        close={() => {
          snakeId.value = undefined;
        }}
        snakeId={snakeId.value}
        sex={null}
        withTitle={false}
      />
    </>
  );
};
