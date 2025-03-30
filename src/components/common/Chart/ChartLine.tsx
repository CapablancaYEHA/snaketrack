import { FC } from "preact/compat";
import { Space } from "@mantine/core";
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, TimeScale, Title, Tooltip } from "chart.js";
import "chartjs-adapter-dayjs-4";
import { Line } from "react-chartjs-2";
import { IFeed } from "@/api/models";
import { makeChartData, makeOptions } from "./const";

ChartJS.register(CategoryScale, PointElement, LineElement, Title, Tooltip, Legend, LinearScale, TimeScale);

interface IProps {
  weightData:
    | {
        date: string;
        weight: number;
      }[]
    | null;
  feedData: IFeed[] | undefined;
  view: "ko" | "snake" | "both";
  scaleX?: any;
}
export const ChartLine: FC<IProps> = ({ weightData, feedData, scaleX = "weeks", view = "both" }) => {
  const chartData = makeChartData(weightData ?? [], feedData ?? [], view);
  return (
    <>
      <div style={{ position: "relative", width: "100%" }}>
        <Line options={makeOptions(scaleX) as any} data={chartData as any} height={420} />
      </div>
      <Space h="lg" />
    </>
  );
};
