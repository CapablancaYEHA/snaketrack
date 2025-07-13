import { ReactNode, useCallback, useState } from "preact/compat";
import { Box, CSSProperties } from "@mantine/core";
import { clsx } from "clsx";
// import calcTree from "relatives-tree";
// import { Connector, ExtNode, Node } from "relatives-tree/lib/types";
import { IResBpClutch } from "@/api/models";
import css from "./style.module.scss";
import { tree } from "./tree";

// FIXME !!!!
interface ILinker {
  //   connector: Connector;
  connector: any;
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
  //   renderNode: (node: ExtNode) => ReactNode;
  renderNode: (node: any) => ReactNode;
}

function ReactFamilyTree(props: ITree) {
  //   const data = calcTree(props.nodes, {
  //     rootId: props.rootId,
  //     placeholders: props.placeholders,
  //   });
  const data: any = {};

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

const WIDTH = 70;
const HEIGHT = 80;

interface FamilyNodeProps {
  //   node: ExtNode;
  node: any;
  isRoot: boolean;
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: CSSProperties;
  clutch: any;
}
function FamilyNode({ node, isRoot, onClick, onSubClick, style, clutch }: FamilyNodeProps) {
  const clickHandler = useCallback(() => onClick(node.id), [node.id, onClick]);
  const clickSubHandler = useCallback(() => onSubClick(node.id), [node.id, onSubClick]);

  return (
    <div className={css.root} style={style}>
      <Box className={clsx(css.inner, css[node.gender], isRoot && css.isRoot)} onClick={clickHandler}>
        <div className={css.id}>{node.id}</div>
      </Box>
      {node.hasSubTree && <div className={clsx(css.sub, css[node.gender])} onClick={clickSubHandler} />}
    </div>
  );
}

const SRow = ({ clutch }: { clutch: IResBpClutch }) => {
  const [rootId, setRootId] = useState(tree[0].id);
  const [selectId, setSelectId] = useState<string>();

  const selected = tree.find((item) => item.id === selectId);

  return (
    <>
      <ReactFamilyTree
        nodes={tree as any}
        rootId={tree[0].id}
        width={WIDTH}
        height={HEIGHT}
        renderNode={(node) => (
          <FamilyNode
            key={node.id}
            node={node}
            isRoot={node.id === rootId}
            onClick={setSelectId}
            onSubClick={setRootId}
            clutch={clutch}
            style={{
              width: WIDTH,
              height: HEIGHT,
              transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`,
            }}
          />
        )}
      />
      {selected && <div>puk</div>}
    </>
  );
};

const makeTree = (origin: IResBpClutch) => {
  return [
    {
      id: origin.female_id,
      gender: "female",
      spouses: origin.males_ids.map((b) => ({ id: b })),
    },
  ].concat(
    origin.males_ids.map((m) => ({
      id: m,
      gender: "male",
      spouses: [{ id: origin.female_id }],
    })),
  );
};
