import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, TimeScale, Title, Tooltip } from "chart.js";
import "chartjs-adapter-dayjs-4";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line } from "react-chartjs-2";
import { makeLineData, makeLineOptions } from "./utils_chart";

ChartJS.register(CategoryScale, PointElement, LineElement, Title, Tooltip, Legend, LinearScale, TimeScale, annotationPlugin);

export const ChartAnalytics = ({ dt }) => {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Line options={makeLineOptions() as any} data={makeLineData(dt) as any} height={420} />
    </div>
  );
};
