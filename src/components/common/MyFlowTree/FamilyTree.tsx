import { FC, useState } from "preact/compat";
import fallback from "@assets/placeholder.webp";
import { Anchor, AspectRatio, Box, Button, Drawer, Flex, Image, LoadingOverlay, Modal, Space, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories } from "@/api/common";
import { useFamilyTree } from "@/api/misc/hooks";
import { urlProxyReplace } from "@/utils/other";
import { FormAddParents } from "../forms/addParents/formAddParents";
import { sortSnakeGenes } from "../genetics/const";
import { GenePill } from "../genetics/geneSelect";
import { FlowElk } from "./FlowElk";

const sigIsOpen = signal<boolean>(false);
const sigIsModalOpen = signal<boolean>(false);

const close = () => (sigIsOpen.value = false);
const open = () => (sigIsOpen.value = true);
const closeMod = () => (sigIsModalOpen.value = false);
const openMod = () => (sigIsModalOpen.value = true);

interface IFamTree {
  targetId: string;
  category: ECategories;
  isEditable?: boolean;
  currentMother?: string | null;
  currentFather?: string | null;
}

export const FamilyTree: FC<IFamTree> = ({ targetId, category, currentMother, currentFather, isEditable = true }) => {
  const userId = localStorage.getItem("USER");
  const { data: tree, isError, isFetching } = useFamilyTree(targetId, category);
  const [selectId, setSelectId] = useState<string>();

  const selected = tree?.persons?.find((item) => item.id === selectId);

  if (isFetching) {
    return <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />;
  }

  if (isError) {
    return (
      <Text fw={500} c="var(--mantine-color-error)" size="sm">
        Ошибка запроса данных, и\или данная категория не поддерживается в этом блоке
      </Text>
    );
  }

  return tree && tree.persons.length > 0 ? (
    <Box maw="100%" w="100%">
      <Modal
        centered
        opened={sigIsModalOpen.value}
        onClose={closeMod}
        size="xs"
        title={<Title order={4}>Указать родителей</Title>}
        keepMounted={false}
        styles={{
          content: { overflow: "visible" },
        }}
      >
        <FormAddParents snakeId={targetId} category={category} onClose={closeMod} currentMother={currentMother} currentFather={currentFather} />
      </Modal>
      {/* FIXME shadow_date_hatch для таких вот кейсов заполнять или как */}
      {isEditable && (!currentMother || !currentFather) ? (
        <Flex maw="100%" w="100%" gap="lg">
          <Text size="sm">Информация о родителях неполная или отсутствует</Text>
          <Button size="compact-xs" onClick={openMod} flex="0 0 auto">
            Исправить
          </Button>
        </Flex>
      ) : null}
      <Space h="xs" />
      <FlowElk
        rawTree={tree}
        targetId={targetId}
        selected={selected as any}
        onSelect={(a) => {
          open();
          setSelectId(a);
        }}
        category={category}
        userId={userId}
      />

      {selected ? (
        <>
          <Drawer
            opened={selected && sigIsOpen.value}
            onClose={close}
            title={<SnakeAnchor selected={selected} category={category} />}
            position="bottom"
            size="auto"
            styles={{
              inner: {
                justifyContent: "center",
              },
              content: {
                height: "auto",
                width: "auto",
                maxWidth: 400,
              },
            }}
            overlayProps={{ backgroundOpacity: 0 }}
            keepMounted={false}
          >
            <Stack gap="sm" align="start">
              <Space h="xs" />
              <Flex gap="xs" style={{ flexFlow: "row wrap" }} align="start">
                {sortSnakeGenes(selected.genes as any).map((a) => (
                  <GenePill item={a} key={`${a.label}_${a.id}`} />
                ))}
              </Flex>
              <AspectRatio ratio={16 / 9} maw="100%" w="100%" mih={170}>
                <Image radius="sm" src={urlProxyReplace(selected.picture)} width="100%" maw="100%" alt="snake_in_drawer" fit="cover" fallbackSrc={fallback} loading="lazy" />
              </AspectRatio>
            </Stack>
          </Drawer>
        </>
      ) : null}
    </Box>
  ) : null;
};

const SnakeAnchor = ({ selected, category }) => {
  const userId: string = localStorage.getItem("USER")!;
  const isOwnerView = selected.owner_id === userId;
  return (
    <Flex>
      {isOwnerView ? (
        <Stack gap="xs">
          <Anchor href={`/snakes/${category}?id=${selected.id}`} display="flex" c="inherit" underline="always" style={{ flexFlow: "row wrap" }}>
            <Text td="underline" style={{ whiteSpace: "nowrap", marginRight: "auto" }}>
              {selected.id}
            </Text>
            <Flex style={{ flexFlow: "row nowrap" }}>
              <Box style={{ flex: "0 0 20px", minWidth: 20 }}>
                <IconSwitch icon={selected.gender} width="20" height="20" />
              </Box>
              <Text size="md" td="underline">
                {selected.snake_name}
              </Text>
            </Flex>
          </Anchor>
          {selected.from_clutch ? (
            <Box w="100%" maw="100%">
              <Anchor href={`/clutches/edit/${category}?id=${selected.from_clutch}`}>
                Кладка <span style={{ textDecoration: "underline" }}>{selected.from_clutch}</span>
              </Anchor>
            </Box>
          ) : null}
        </Stack>
      ) : (
        <Box display="flex">
          <Text style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: category === ECategories.BP ? 52 : 200 }}>{selected.id}</Text>
          {`\u00a0`}
          <IconSwitch icon={selected.gender} width="20" height="20" />
        </Box>
      )}
    </Flex>
  );
};
