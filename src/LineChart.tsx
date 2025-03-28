import React from "react";
import type { ChartData, LineControllerChartOptions } from "chart.js" with { "resolution-mode": "import" };
import type { Line } from "react-chartjs-2" with { "resolution-mode": "import" };
import LinearProgress from "@mui/material/LinearProgress";

/**
 * Line chart
 */
export type LineChartProps = {
  /**
   * Chart data
   */
  data: ChartData<"line">;

  /**
   * Options
   */
  options?: LineControllerChartOptions;

  /**
   * Subtitle
   */
  subtitle?: string;

  /**
   * Title
   */
  title?: string;
};

/**
 * Line chart
 * @param props Props
 * @returns Component
 */
export function LineChart(props: LineChartProps) {
  // Destruct
  const { data, options, subtitle, title } = props;

  // State
  const [LineType, setLineType] = React.useState<typeof Line>();

  React.useEffect(() => {
    Promise.all([
      import("react-chartjs-2"),
      import("chart.js"),
      import("chartjs-plugin-datalabels")
    ]).then(
      ([
        { Line },
        {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend
        },
        ChartDataLabels
      ]) => {
        // https://www.chartjs.org/docs/latest/getting-started/
        ChartJS.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend,

          ChartDataLabels as any // CommonJS says 'id' is missing
        );

        setLineType(Line);
      }
    );
  }, []);

  return LineType == null ? (
    <LinearProgress />
  ) : (
    <LineType
      options={{
        scales: {
          x: {
            ticks: {
              display: false //this will remove only the label
            }
          }
        },
        responsive: true,
        plugins: {
          datalabels: {
            display: (context) => context.dataset.data.length <= 31,
            align: "end"
          },
          legend: {
            position: "top" as const
          },
          subtitle: subtitle ? { text: subtitle, display: true } : undefined,
          title: title
            ? {
                text: title,
                display: true
              }
            : undefined
        },
        ...options
      }}
      data={data}
    />
  );
}
