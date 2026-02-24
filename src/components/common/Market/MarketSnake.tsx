import { useState } from "preact/hooks";
import { Anchor, Box, Button, CopyButton, Divider, Flex, Indicator, NumberFormatter, Paper, RemoveScroll, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { Carousel } from "@/components/Carousel";
import { sortSnakeGenes } from "@/components/common/genetics/const";
import { GenePill } from "@/components/common/genetics/geneSelect";
import { categToTitle } from "@/components/common/utils";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, IMarketRes } from "@/api/common";
import { dateTimeDiff, getAge, getDateCustom, getDateShort } from "@/utils/time";
import { FamilyTree } from "../FamilyTree";
import styles from "../forms/styles.module.scss";
import { snakeStatusToColor, snakeStatusToLabel } from "./utils";

interface IProp {
  category: ECategories;
  data: IMarketRes;
}

export function MarketSnake({ category, data }: IProp) {
  const dt = {
    title: snakeStatusToLabel[data.status],
    text: `${data.sex === "female" ? 0.1 : 1.0} ${categToTitle[category]} ${data.genes?.map((g) => g.label).join(" ")}`,
    url: window.location.href,
  };
  const [tab, setTab] = useState("common");

  const isCan = navigator?.canShare?.(dt);
  const isShowDiscount = data.discount_price && data.discount_until ? dateTimeDiff(data.discount_until, "date") > 0 : data.discount_price && !data.discount_until ? data.discount_price : false;

  const share = async (func) => {
    try {
      if (!isCan) {
        func();
      } else {
        await navigator.share(dt);
      }
    } catch {
      func();
    }
  };

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      <Flex maw="100%" w="100%" align="center" gap="sm">
        <Indicator position="middle-start" inline size={8} color={snakeStatusToColor[data.status]} processing zIndex={3}>
          <Text fw={500} size="xs" ml="sm">
            {snakeStatusToLabel[data.status]}
          </Text>
        </Indicator>

        <CopyButton value="window.location.href" timeout={300000}>
          {({ copied, copy }) => (
            <Button variant="default" size="compact-xs" onClick={() => share(copy)} ml="auto">
              {(copied && isCan) || isCan ? "Поделиться" : copied ? "Скопировано" : "Копировать"}
            </Button>
          )}
        </CopyButton>
      </Flex>

      <Box m="0 auto">
        <SegmentedControl
          size="xs"
          value={tab}
          onChange={setTab}
          data={[
            { label: "Общее", value: "common" },
            { label: "Семейное древо", value: "tree" },
          ]}
        />
      </Box>

      {tab !== "tree" ? (
        <>
          <Flex align="stretch" columnGap="xl" rowGap="sm" w="100%" direction={{ base: "column", sm: "row" }}>
            <Stack flex={{ base: "1", sm: "0 1 50%" }}>
              <Carousel images={data.pictures} />
            </Stack>
            <Stack gap="xs" flex="1">
              <Flex maw="100%" w="100%" align="center" gap="4px">
                <IconSwitch icon={data.sex!} width="24" height="24" style={{ minWidth: 0, minHeight: 0 }} />
                <Title order={4}>{categToTitle[category]}</Title>
                <Text ml="auto" size="sm">
                  <strong>Возраст:</strong> {getAge(data.date_hatch)}
                </Text>
              </Flex>
              <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
                {sortSnakeGenes(data.genes as any)?.map((a) => <GenePill item={a} key={`${a.label}_${a.id}`} />)}
              </Flex>

              {isShowDiscount ? (
                <Flex gap="sm" align="baseline">
                  <Text fw={500} size="xs" c="dark.3">
                    <s>
                      <NumberFormatter prefix="₽ " value={data.sale_price} thousandSeparator=" " />
                    </s>
                  </Text>
                  <Text fw={500} size="xl">
                    <NumberFormatter prefix="₽ " value={data.discount_price!} thousandSeparator=" " />
                  </Text>
                </Flex>
              ) : (
                <Text fw={500} size="xl">
                  <NumberFormatter prefix="₽ " value={data.sale_price} thousandSeparator=" " />
                </Text>
              )}

              <Divider w="100%" maw="100%" opacity={0.5} />
              <Stack gap="4px">
                <Text size="sm" fw={500}>
                  <strong>Продавец:</strong>
                </Text>
                <Flex>
                  <Text size="sm">{data.username}</Text>
                  <Text size="sm" ml="auto">
                    c нами с {getDateCustom(data.user_createdat, "D MMM YYYY")}
                  </Text>
                </Flex>
              </Stack>

              <Text size="sm">
                <strong>Город:</strong> {data.city_name}
              </Text>
              <Text size="sm">
                <strong>Создано:</strong> {getDateShort(data.created_at)}
              </Text>
              {data.updated_at ? (
                <Text size="sm">
                  <strong>Обновлено:</strong> {getDateShort(data.updated_at)}
                </Text>
              ) : null}
            </Stack>
          </Flex>
          {data.contacts_group || data.contacts_telegram ? (
            <Flex align="flex-start" maw="100%" className={styles.w70} gap="lg">
              {data.contacts_group ? (
                <Anchor href={data.contacts_group} target="_blank" rel="nofollow noopener noreferrer" underline="never">
                  <IconSwitch icon="vk" width="32" height="32" />
                </Anchor>
              ) : null}
              {data.contacts_telegram ? (
                <Anchor href={`https://t.me/${data.contacts_telegram.startsWith("@") ? data.contacts_telegram.slice(1) : data.contacts_telegram}`} target="_blank" rel="nofollow noopener noreferrer" underline="never">
                  <IconSwitch icon="telegram" width="32" height="32" />
                </Anchor>
              ) : null}
            </Flex>
          ) : null}
          <Paper shadow="sm" radius="md" p="sm" w="100%">
            <Text size="sm" style={{ overflowX: "hidden" }}>
              {data.description}
            </Text>
          </Paper>
        </>
      ) : (
        <RemoveScroll style={{ maxWidth: "100%", width: "100%", display: "flex" }}>
          <FamilyTree targetId={data.snake_id} category={category} isEditable={false} />
        </RemoveScroll>
      )}
    </Stack>
  );
}
