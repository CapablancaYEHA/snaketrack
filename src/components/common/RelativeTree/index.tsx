import { FC, ReactNode, useEffect, useState } from "preact/compat";
import fallback from "@assets/placeholder.png";
import { Anchor, AspectRatio, Box, Button, CSSProperties, Drawer, Flex, Image, Modal, Space, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { clsx } from "clsx";
import { isEmpty } from "lodash-es";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useBpTree } from "@/api/ballpythons/misc";
import { ECategories } from "@/api/common";
import { FormAddParents } from "../forms/addParents/formAddParents";
import { sortSnakeGenes } from "../genetics/const";
import { GenePill } from "../genetics/geneSelect";
import calcTree from "./helper";
import { Connector, ExtNode, Node } from "./helper/types";
import css from "./style.module.scss";

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

function ReactFamilyTree(props: ITree) {
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

const FamilyNode: FC<FamilyNodeProps> = ({ node, targetId, onSelect, onSubClick, style }) => {
  const isTraget = targetId === node.id;
  return (
    <div className={css.root} style={style}>
      <Stack gap="sm" className={clsx(css.inner, isTraget && css.isTarget)} onClick={() => onSelect(node.id)} style={{ transform: "translate3d(0, 0, 0)" }}>
        <Flex gap="xs" style={{ flexFlow: "row wrap" }} align="center">
          <Text size="xs">{node.id}</Text>
          <IconSwitch icon={node.gender} width="20" height="20" />
        </Flex>
        <AspectRatio ratio={16 / 9} maw={196}>
          <Image radius="sm" src={node.picture} width="100%" alt="snake_in_tree" fit="cover" fallbackSrc={fallback} loading="lazy" />
        </AspectRatio>

        <Flex gap="xs" className={css.overflowed} style={{ flexFlow: "row wrap" }} align="start" h={74} p={2}>
          {sortSnakeGenes(node.genes as any).map((a) => (
            <GenePill item={a} key={`${a.label}_${a.id}`} size="xs" />
          ))}
        </Flex>
      </Stack>
      {node.hasSubTree && <div className={clsx(css.sub, css[node.gender])} onClick={() => onSubClick(node.id)} />}
    </div>
  );
};

export const SFamTree = ({ targetId, category = ECategories.BP }) => {
  const { data: tree } = useBpTree(targetId);
  const [rootId, setRootId] = useState(tree?.[0].id);
  const [selectId, setSelectId] = useState<string>();

  const selected = tree?.find((item) => item.id === selectId);
  const targetNode = tree?.find((node) => node.id === targetId);

  useEffect(() => {
    setRootId(tree?.[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tree)]);

  return rootId && tree && tree.length > 0 ? (
    <Box maw="100%" w="100%">
      <Modal centered opened={sigIsModalOpen.value} onClose={closeMod} size="xs" title={<Title order={4}>Указать родителей</Title>} keepMounted={false}>
        <FormAddParents snakeId={targetId} />
      </Modal>
      {/* FIXME shadow_date_hatch для таких вот кейсов */}
      {isEmpty(targetNode?.parents) ? (
        <Flex maw="100%" w="100%" gap="lg">
          <Text size="sm">Без информация о родителях невозможно построить древо</Text>
          <Button size="compact-xs" onClick={openMod} flex="0 0 auto">
            Добавить
          </Button>
        </Flex>
      ) : null}

      <Space h="md" />
      <TransformWrapper
        //   initialScale={0.4}
        minScale={0.4}
        // initialPositionX={100}
        // initialPositionY={100}
        limitToBounds={false}
        centerOnInit
      >
        <TransformComponent wrapperStyle={{ maxWidth: "100%", width: "100%", height: "auto" }} contentStyle={{ width: "100%", height: "100%", justifyContent: "center", cursor: "grab" }}>
          <ReactFamilyTree
            nodes={tree as any}
            rootId={rootId}
            width={WIDTH}
            height={HEIGHT}
            renderNode={(node) => (
              <FamilyNode
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
              <Flex gap="xs" style={{ flexFlow: "row wrap" }} align="center">
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
        <Anchor href={`/snakes/${category}?id=${selected.id}`} display="flex" c="inherit" underline="always">
          <Text td="underline">{selected.id}</Text>
          {`\u00a0`}
          <IconSwitch icon={selected.gender} width="20" height="20" />
          {`\u00a0`}
          <Text size="md" td="underline">
            {selected.snake_name}
          </Text>
        </Anchor>
      ) : (
        <Box display="flex">
          <Text td="underline">{selected.id}</Text>
          {`\u00a0`}
          <IconSwitch icon={selected.gender} width="20" height="20" />
        </Box>
      )}
    </Flex>
  );
};
