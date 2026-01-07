import { FC, ReactNode, useEffect, useState } from "preact/compat";
import fallback from "@assets/placeholder.webp";
import { Anchor, AspectRatio, Box, Button, CSSProperties, Drawer, Flex, Image, LoadingOverlay, Modal, Space, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { clsx } from "clsx";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories } from "@/api/common";
import { useFamilyTree } from "@/api/misc/hooks";
import { FormAddParents } from "../forms/addParents/formAddParents";
import { sortSnakeGenes } from "../genetics/const";
import { GenePill } from "../genetics/geneSelect";
import calcTree from "./helper";
import { Connector, ExtNode, Node } from "./helper/types";
import css from "./style.module.scss";

const magic_number = 780;

const sigIsOpen = signal<boolean>(false);
const sigIsModalOpen = signal<boolean>(false);

const close = () => (sigIsOpen.value = false);
const open = () => (sigIsOpen.value = true);
const closeMod = () => (sigIsModalOpen.value = false);
const openMod = () => (sigIsModalOpen.value = true);

interface ILinker {
  connector: Connector;
  width: number;
  height: number;
}

function Linker({ connector, width, height }: ILinker) {
  const [x1, y1, x2, y2] = connector;

  return (
    <i
      style={{
        position: "absolute",
        width: Math.max(1, (x2 - x1) * width + 1),
        height: Math.max(1, (y2 - y1) * height + 1),
        background: "var(--mantine-color-yellow-8)",
        transform: `translate(${x1 * width}px, ${y1 * height}px)`,
        pointerEvents: "none",
      }}
    />
  );
}

interface ITree {
  nodes: Node[];
  rootId: string;
  width: number;
  height: number;
  placeholders?: boolean;
  className?: string;
  renderNode: (node: ExtNode) => ReactNode;
}

function RenderElems(props: ITree) {
  const data = calcTree(props.nodes, {
    rootId: props.rootId,
    placeholders: props.placeholders,
  });

  const width = props.width / 2;
  const height = props.height / 2;

  return (
    <div
      className={props.className}
      style={{
        position: "relative",
        width: data.canvas.width * width,
        height: data.canvas.height * height,
        minHeight: magic_number,
      }}
    >
      {data.connectors.map((connector, idx) => (
        <Linker key={idx} connector={connector} width={width} height={height} />
      ))}
      {data.nodes.map(props.renderNode)}
    </div>
  );
}

const WIDTH = 196;
const HEIGHT = 260;

interface FamilyNodeProps {
  node: ExtNode;
  isRoot: boolean;
  targetId: string;
  onSelect: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: CSSProperties;
  selected: boolean;
}

const SFamilyNode: FC<FamilyNodeProps> = ({ node, targetId, onSelect, onSubClick, style }) => {
  const isTraget = targetId === node.id;

  return (
    <div className={css.root} style={style}>
      <Stack gap="sm" className={clsx(css.inner, isTraget && css.isTarget)} onClick={() => onSelect(node.id)} style={{ transform: "translate3d(0, 0, 0)" }}>
        <Flex component="section" gap="xs" style={{ flexFlow: "row nowrap" }} align="center" maw="100%">
          <Text size="xs" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.id}
          </Text>
          <Box style={{ flex: "0 0 20px", minWidth: 20 }}>
            <IconSwitch icon={node.gender} width="20" height="20" />
          </Box>
        </Flex>
        <AspectRatio ratio={16 / 9} maw={196}>
          <Image radius="sm" src={node.picture} width="100%" alt="snake_in_tree" fit="cover" fallbackSrc={fallback} loading="lazy" />
        </AspectRatio>

        <Box mah={88} h="100%" p={2} className={css.overflowed}>
          <Flex gap="xs" style={{ flexFlow: "row wrap" }} align="start">
            {sortSnakeGenes(node.genes as any).map((a) => (
              <GenePill item={a} key={`${a.label}_${a.id}`} size="xs" />
            ))}
          </Flex>
        </Box>
      </Stack>
      {/* FIXME разобраться с subtree, зачем и как оно и где */}
      {/* {node.hasSubTree && <div className={clsx(css.sub, css[node.gender])} onClick={() => onSubClick(node.id)} />} */}
    </div>
  );
};

interface IFamTree {
  targetId: string;
  category: ECategories;
  isEditable?: boolean;
  currentMother?: string | null;
  currentFather?: string | null;
}

export const FamilyTree: FC<IFamTree> = ({ targetId, category, currentMother, currentFather, isEditable = true }) => {
  const { data: tree, isError, isFetching } = useFamilyTree(targetId, category);
  const [rootId, setRootId] = useState(tree?.[0].id);
  const [selectId, setSelectId] = useState<string>();

  const selected = tree?.find((item) => item.id === selectId);
  const targetNode = tree?.find((node) => node.id === targetId);

  useEffect(() => {
    setRootId(tree?.[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tree)]);

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

  return rootId && tree && tree.length > 0 ? (
    <Box maw="100%" w="100%">
      <Modal centered opened={sigIsModalOpen.value} onClose={closeMod} size="xs" title={<Title order={4}>Указать родителей</Title>} keepMounted={false}>
        <FormAddParents snakeId={targetId} category={category} onClose={closeMod} currentMother={currentMother} currentFather={currentFather} />
      </Modal>
      {/* FIXME shadow_date_hatch для таких вот кейсов заполнять или как */}
      {isEditable && (targetNode?.parents?.length ?? 0) < 2 ? (
        <Flex maw="100%" w="100%" gap="lg">
          <Text size="sm">Информация о родителях неполная или отсутствует</Text>
          <Button size="compact-xs" onClick={openMod} flex="0 0 auto">
            Исправить
          </Button>
        </Flex>
      ) : null}
      <Space h="xs" />
      <TransformWrapper
        minScale={0.4}
        // initialScale={0.4}
        // initialPositionX={100}
        // initialPositionY={100}
        limitToBounds={false}
        centerOnInit
      >
        <TransformComponent wrapperStyle={{ maxWidth: "100%", width: "100%", height: "auto", cursor: "grab" }} contentStyle={{ width: "100%", height: "100%", justifyContent: "center" }}>
          <RenderElems
            nodes={tree as any}
            rootId={rootId}
            width={WIDTH}
            height={HEIGHT}
            renderNode={(node) => (
              <SFamilyNode
                key={node.id}
                node={node}
                isRoot={node.id === rootId}
                targetId={targetId}
                selected={selected as any}
                onSelect={(a) => {
                  open();
                  setSelectId(a);
                }}
                onSubClick={setRootId}
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`,
                }}
              />
            )}
          />
        </TransformComponent>
      </TransformWrapper>
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
                <Image radius="sm" src={selected.picture} width="100%" maw="100%" alt="snake_in_drawer" fit="cover" fallbackSrc={fallback} loading="lazy" />
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
  return (
    <Flex>
      {selected.owner_id === userId ? (
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
      ) : (
        <Box display="flex">
          <Text>{selected.id}</Text>
          {`\u00a0`}
          <IconSwitch icon={selected.gender} width="20" height="20" />
        </Box>
      )}
    </Flex>
  );
};
