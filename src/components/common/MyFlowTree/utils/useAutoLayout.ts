import { useCallback, useLayoutEffect, useRef } from "preact/hooks";
import { useReactFlow } from "@xyflow/react";
import ELK from "elkjs/lib/elk-api.js";

const elk = new ELK({
  workerUrl: "/elk-worker.min.js",
});

const elkOptions = {
  "elk.direction": "DOWN",
  "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
  "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  "elk.layered.spacing.edgeNodeBetweenLayers": "30",
  "org.eclipse.elk.layered.nodePlacement.networkSimplex.nodeFlexibility": "PORTS",
  "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",

  // тоже неплохо выглядит
  //   "elk.algorithm": "layered",
  //   "elk.direction": "DOWN",
  //   "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  //   "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "FALSE",
  //   "elk.layered.spacing.edgeNodeBetweenLayers": "30",
  //   "elk.spacing.edgeNode": "40",
};

export function useAutoLayout({ padding = 0.2 } = {}) {
  const { getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();

  const lastSignature = useRef("");

  const updateLayout = useCallback(async () => {
    const nodes = getNodes();
    const edges = getEdges();

    if (nodes.length === 0 || !nodes.every((n) => n.data?.width && n.data?.height)) {
      return;
    }

    const elkGraph = {
      id: "root",
      layoutOptions: elkOptions,
      children: nodes.map((n) => ({
        id: n.id,
        width: Number(n.data?.width),
        height: Number(n.data?.height),
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sources: [e.source],
        targets: [e.target],
      })),
    };

    const layout = await elk.layout(elkGraph);

    const positionedNodes = nodes.map((node) => {
      const layoutNode = layout.children?.find((n) => n.id === node.id);
      return layoutNode ? { ...node, position: { x: layoutNode.x ?? 0, y: layoutNode.y ?? 0 } } : node;
    });

    setNodes(positionedNodes);
    setEdges(edges);
    fitView({ padding });
  }, [getNodes, getEdges, setNodes, setEdges, fitView, padding]);

  useLayoutEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const signature = nodes.map((n) => n.id).join(",") + "|" + edges.map((e) => e.id).join(",");

    if (signature !== lastSignature.current) {
      lastSignature.current = signature;
      setTimeout(updateLayout, 100);
    }
  });
}
