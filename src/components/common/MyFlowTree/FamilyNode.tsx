/* eslint-disable no-param-reassign */
import { FC } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";
import fallback from "@assets/placeholder.webp";
import { AspectRatio, Box, Flex, Image, Stack, Text } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";
import { clsx } from "clsx";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories } from "@/api/common";
import { urlProxyReplace } from "@/utils/other";
import { sortSnakeGenes } from "../genetics/const";
import { GenePill } from "../genetics/geneSelect";
import css from "./style.module.scss";
import { HEIGHT, WIDTH } from "./utils/familyCrud";
import { IFamilyNode } from "./utils/types";

export const FamilyNode: FC<IFamilyNode> = ({ data, targetId, onSelect, selected, userId, category }) => {
  const isTraget = targetId === data?.id;
  const isOwnerView = userId && userId === data?.owner_id;
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
    <Box ref={nodeRef} w={WIDTH} h={HEIGHT} p="0px !important">
      <Handle type="target" position={Position.Top} />
      <Box className={css.root}>
        <Stack gap="sm" className={clsx(css.inner, isTraget && css.isTarget)} onClick={() => onSelect(data?.id)} style={{ transform: "translate3d(0, 0, 0)" }}>
          <Flex component="section" gap="xs" style={{ flexFlow: "row nowrap" }} align="center" maw="100%">
            <Text size="xs" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: category === ECategories.BP ? 52 : "auto" }}>
              {isOwnerView ? data?.snake_name : data?.id}
            </Text>
            <Box style={{ flex: "0 0 20px", minWidth: 20 }}>
              <IconSwitch icon={data?.gender} width="20" height="20" />
            </Box>
          </Flex>
          <AspectRatio ratio={16 / 9} maw={196}>
            <Image radius="sm" src={urlProxyReplace(data.picture)} width="100%" alt="snake_in_tree" fit="cover" fallbackSrc={fallback} loading="lazy" />
          </AspectRatio>

          <Box mah={88} h="100%" p={2} className={css.overflowed}>
            <Flex gap="xs" style={{ flexFlow: "row wrap" }} align="start">
              {sortSnakeGenes(data.genes as any).map((a) => (
                <GenePill item={a} key={`${a.label}_${a.id}`} />
              ))}
            </Flex>
          </Box>
        </Stack>
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
};
