import { FC, ReactNode, useCallback, useEffect, useState } from "preact/compat";
import fallback from "@assets/placeholder.png";
import { Anchor, AspectRatio, Box, Button, CSSProperties, Drawer, Flex, Image, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { clsx } from "clsx";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useBpTree } from "@/api/ballpythons/misc";
import { ECategories, ESupabase, IUpdReq } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { sortSnakeGenes } from "../genetics/const";
import { GenePill } from "../genetics/geneSelect";
import { SexName } from "../sexName";
import calcTree from "./helper";
import { Connector, ExtNode, Node } from "./helper/types";
import css from "./style.module.scss";

// import { tree_2 as tree } from "./tree_2";

const sigIsOpen = signal<boolean>(false);

const close = () => (sigIsOpen.value = false);
const open = () => (sigIsOpen.value = true);

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
        background: `#999`,
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
const HEIGHT = 300;

interface FamilyNodeProps {
  node: ExtNode;
  isRoot: boolean;
  targetId: string;
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: CSSProperties;
  selected: boolean;
}

const FamilyNode: FC<FamilyNodeProps> = ({ node, isRoot, targetId, onClick, onSubClick, style, selected }) => {
  const isTraget = targetId === node.id;
  return (
    <div className={css.root} style={style}>
      <Stack gap="sm" className={clsx(css.inner, isTraget && css.isRoot)} onClick={() => onClick(node.id)} style={{ transform: "translate3d(0, 0, 0)" }}>
        <Text size="xs">{node.id}</Text>
        <AspectRatio ratio={16 / 9} maw={196}>
          <Image radius="sm" src={node.picture} width="100%" alt="snake_in_tree" fit="cover" fallbackSrc={fallback} loading="lazy" />
        </AspectRatio>

        <Flex gap="xs" style={{ flexFlow: "row wrap" }} align="center">
          <IconSwitch icon={node.gender} width="20" height="20" />
          {sortSnakeGenes(node.genes as any).map((a) => (
            <GenePill item={a} key={`${a.label}_${a.id}`} size="xs" />
          ))}
        </Flex>
      </Stack>
      {node.hasSubTree && <div className={clsx(css.sub, css[node.gender])} onClick={() => onSubClick(node.id)} />}
    </div>
  );
};

// TODO Выбор родителей из своих змей + ввод по айдишнику чисто

export const SFamTree = ({ targetId = "ac627ab1cc", category = ECategories.BP }) => {
  const { data: tree } = useBpTree(targetId);
  const { mutate } = useSupaUpd<IUpdReq>(ESupabase.BP);
  const [rootId, setRootId] = useState(tree?.[0].id);
  const [selectId, setSelectId] = useState<string>();

  const selected = tree?.find((item) => item.id === selectId);

  //   const writeParentsToTarget = () =>
  //     mutate({
  //       upd: {
  //         mother_id: "0266e33d3f",
  //         father_id: "01161aaa0b",
  //         last_action: "update",
  //       },
  //       id: "ac627ab1cc",
  //     });

  useEffect(() => {
    setRootId(tree?.[0].id);
  }, [JSON.stringify(tree)]);

  return rootId && tree && tree.length > 0 ? (
    <>
      {/* <Button onClick={writeParentsToTarget}>Сделать запись</Button> */}
      <TransformWrapper initialScale={0.4} minScale={0.4} initialPositionX={100} initialPositionY={100} limitToBounds={false} centerOnInit>
        <TransformComponent wrapperStyle={{ maxWidth: "100%", width: "100%", height: "auto" }} contentStyle={{ width: "100%", height: "100%" }}>
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
                // isRoot={node.id === targetId}
                targetId={targetId}
                // onClick={setSelectId}
                selected={tree?.find((item) => item.id === selectId)}
                onClick={(a) => {
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
        <Drawer
          opened={selected && sigIsOpen.value}
          onClose={close}
          // title=
          position="bottom"
          size="auto"
          styles={{
            inner: {
              justifyContent: "center",
            },
            content: {
              height: "auto",
              width: "auto",
              maxWidth: 640,
            },
          }}
          overlayProps={{ backgroundOpacity: 0 }}
          keepMounted={false}
        >
          {/* FIXME Ссылка на змею и отображение её имени только если ты - owner */}
          <Stack gap="sm" align="start">
            <Flex>
              <Text size="md" td="underline">
                Региус
              </Text>
              <Anchor href={`/snakes/${category}?id=${selected.id}`} display="flex" c="inherit" underline="always">
                <IconSwitch icon={selected.gender} width="20" height="20" />
                {`\u00a0`}
                <Text td="underline">{selected.id}</Text>
                {`\u00a0`}
                <Text size="md" td="underline">
                  {selected.snake_name}
                </Text>
              </Anchor>
            </Flex>

            <Flex gap="xs" style={{ flexFlow: "row wrap" }} align="center">
              {sortSnakeGenes(selected.genes as any).map((a) => (
                <GenePill item={a} key={`${a.label}_${a.id}`} />
              ))}
            </Flex>
            <AspectRatio ratio={16 / 9}>
              <Image radius="sm" src={selected.picture} width="100%" maw="100%" alt="snake_in_drawer" fit="cover" fallbackSrc={fallback} loading="lazy" />
            </AspectRatio>
          </Stack>
        </Drawer>
      ) : null}
    </>
  ) : null;
};
