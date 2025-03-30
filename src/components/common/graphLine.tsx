import { Space } from "@mantine/core";
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, TimeScale, Title, Tooltip } from "chart.js";
import "chartjs-adapter-dayjs-4";
import { Line } from "react-chartjs-2";
import { makeChartData, makeOptions } from "./const";

ChartJS.register(CategoryScale, PointElement, LineElement, Title, Tooltip, Legend, LinearScale, TimeScale);

export const GraphLinear = ({ data, scaleX = "weeks" }) => {
  const chartData = makeChartData(data ?? []);
  return (
    <>
      <div style={{ position: "relative", width: "100%" }}>
        <Line options={makeOptions(scaleX) as any} data={chartData as any} height={420} />
      </div>
      <Space h="lg" />
    </>
  );
};
