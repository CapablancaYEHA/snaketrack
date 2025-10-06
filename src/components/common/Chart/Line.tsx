import { FC } from "preact/compat";
import { Text } from "@mantine/core";
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, TimeScale, Title, Tooltip } from "chart.js";
import "chartjs-adapter-dayjs-4";
import { Bubble, Line } from "react-chartjs-2";
import { IFeed } from "@/api/common";
import { bubbleOptions, makeBubbleData, makeLineData, makeLineOptions } from "./const";

ChartJS.register(CategoryScale, PointElement, LineElement, Title, Tooltip, Legend, LinearScale, TimeScale);

interface ILine {
  weightData:
    | {
        date: string;
        weight: number;
      }[]
    | null;
  feedData: IFeed[] | null;
  view: "ko" | "snake" | "both";
  scaleX?: any;
}

export const ChartLine: FC<ILine> = ({ weightData, feedData, scaleX = "weeks", view = "both" }) => {
  const chartData = makeLineData(weightData ?? [], feedData ?? [], view);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Line options={makeLineOptions(scaleX) as any} data={chartData as any} height={420} />
    </div>
  );
};

export const ChartBubble = ({ shedData }) => {
  const bubData = shedData == null ? ({} as any) : makeBubbleData(shedData);
  return shedData == null ? (
    <Text size="md" fw={500} ta="center" w="100%">
      Информация о линьках отсутствует на данный момент
    </Text>
  ) : (
    <div style={{ position: "relative", width: "100%" }}>
      <Bubble options={bubbleOptions as any} data={bubData} height={100} />
    </div>
  );
};
