/* eslint-disable no-param-reassign */
import { useEffect, useRef } from "preact/hooks";
import { Box } from "@mantine/core";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { edgeColor } from "./utils/familyCrud";
import { PseudoNodeType } from "./utils/types";

export default function PseudoNode({ data }: NodeProps<PseudoNodeType>) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nodeRef.current) {
      const width = nodeRef.current.offsetWidth;
      const height = nodeRef.current.offsetHeight;
      data.width = width;
      data.height = height;
    }
  }, [data]);

  return (
    <Box ref={nodeRef} w={1} h={1} style={{ pointerEvents: "none", background: edgeColor, border: "none" }}>
      <Handle type="target" position={Position.Top} style={{ width: 0, height: 0, border: "none" }} />
      <Handle type="source" position={Position.Bottom} style={{ width: 0, height: 0, border: "none" }} />
    </Box>
  );
}
