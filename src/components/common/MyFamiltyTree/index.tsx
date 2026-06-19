import { Box, Stack } from "@mantine/core";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import css from "./style.module.scss";
import { tree } from "./tree";
import { calcTree } from "./utils";

const WIDTH = 196;
const HEIGHT = 260;
const magic_number = 780;

// root = левел без родителй
// source->target, relationType: parent|Spouse|sibling|child, level, order - порядок в ряду

export const MyFamilyTree = () => {
  const data = calcTree(tree);
  console.log("data", data);
  return (
    <Box maw="100%" w="100%">
      <TransformWrapper
        minScale={0.4}
        // initialScale={0.4}
        // initialPositionX={0}
        // initialPositionY={0}
        limitToBounds={false}
        centerOnInit
        wheel={{ step: 0.005 }}
      >
        <TransformComponent wrapperStyle={{ maxWidth: "100%", width: "100%", height: "auto", cursor: "grab", background: "white" }} contentStyle={{ width: "100%", height: "100%", justifyContent: "center" }}>
          <div
            id="mass_rendered_with_map_inside"
            style={{
              position: "relative",
              // width: data.canvas.width * width,
              // height: data.canvas.height * height,
              minHeight: magic_number,
            }}
          >
            {data.map((node) => (
              <div
                key={node.id}
                id="single_node"
                className={css.root}
                style={{
                  border: "1px solid red",
                  width: WIDTH,
                  height: HEIGHT,
                  transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`,
                }}
              >
                {node.id}
              </div>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </Box>
  );
};
