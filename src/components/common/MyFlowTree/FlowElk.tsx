import { FC } from "preact/compat";
import { useLayoutEffect, useMemo, useState } from "preact/hooks";
import { Box, Popover, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Background, ConnectionLineType, Panel, ReactFlow, ReactFlowProvider, useEdgesState, useNodesInitialized, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { FamilyNode } from "./FamilyNode";
import PseudoNode from "./PseudoNode";
import { edgeColor, magic_number, prepareFinal, prepareNodes } from "./utils/familyCrud";
import { IFlow } from "./utils/types";
import { useAutoLayout } from "./utils/useAutoLayout";

export const Flow: FC<IFlow> = ({ targetId, selected, onSelect, category, userId, rawTree }) => {
  const nodesInitialized = useNodesInitialized();
  const initialData = prepareFinal(prepareNodes(rawTree));
  const [opened, { close, open }] = useDisclosure(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);
  const [isVis, setVis] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      person: (dt) => <FamilyNode targetId={targetId} selected={selected} onSelect={onSelect} category={category} userId={userId} data={dt.data} />,
      pseudo: PseudoNode,
    }),
    [],
  );

  useAutoLayout();

  useLayoutEffect(() => {
    if (nodesInitialized) {
      setTimeout(() => setVis(true), 250);
    }
  }, [nodesInitialized]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes as any}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      connectionLineType={ConnectionLineType.SmoothStep}
      defaultEdgeOptions={{ type: "step", style: { stroke: edgeColor, strokeWidth: 1 } }}
      edgesFocusable={false}
      nodesConnectable={false}
      nodesDraggable={false}
      fitView
      style={{ opacity: !isVis ? 0 : 1 }}
    >
      <Background />
      <Panel position="top-left" className="flex flex-col gap-2">
        <Popover width={360} position="bottom" withArrow shadow="md" opened={opened}>
          <Popover.Target>
            <Box onMouseEnter={open} onMouseLeave={close}>
              <IconSwitch icon="info" width="36" height="36" />
            </Box>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="sm">Семейное древо строится исключительно вверх от целевой змеи. На одной линии с ней отображаются сиблинги из той же кладки. Если сиблинги не были найдены, то отображаются вообще все дети данной пары</Text>
          </Popover.Dropdown>
        </Popover>
      </Panel>
    </ReactFlow>
  );
};

export function FlowElk(props: IFlow) {
  const { targetId, selected, onSelect, category, userId, rawTree } = props;

  return (
    <Box maw="100%" w="100%" h="100%" mih={magic_number}>
      <ReactFlowProvider>
        <Flow targetId={targetId} selected={selected} onSelect={onSelect} category={category} userId={userId} rawTree={rawTree} />
      </ReactFlowProvider>
    </Box>
  );
}
