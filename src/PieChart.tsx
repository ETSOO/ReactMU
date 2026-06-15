import React from "react";
import type { ChartData, ChartOptions } from "chart.js" with {
  "resolution-mode": "import"
};
import type { Pie } from "react-chartjs-2" with {
  "resolution-mode": "import"
};
import LinearProgress from "@mui/material/LinearProgress";

/**
 * Pie chart
 */
export type PieChartProps = {
  /**
   * Chart data
   */
  data: ChartData<"pie">;

  /**
   * Options
   */
  options?: ChartOptions<"pie">;

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
 * Pie chart
 * @param props Props
 * @returns Component
 */
export function PieChart(props: PieChartProps) {
  // Destruct
  const { data, options, subtitle, title } = props;

  // State
  const [PieType, setPieType] = React.useState<typeof Pie>();

  React.useEffect(() => {
    Promise.all([
      import("react-chartjs-2"),
      import("chart.js"),
      import("chartjs-plugin-datalabels")
    ]).then(
      ([
        { Pie },
        {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          ArcElement,
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
          ArcElement,
          Title,
          Tooltip,
          Legend,

          ChartDataLabels as any // CommonJS says 'id' is missing
        );

        setPieType(Pie);
      }
    );
  }, []);

  return PieType == null ? (
    <LinearProgress />
  ) : (
    <PieType
      options={{
        scales: {
          x: {
            ticks: {
              display: true // When false, this will remove x labels
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
