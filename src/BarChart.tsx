import React from "react";
import type { ChartData, ChartOptions } from "chart.js" with {
  "resolution-mode": "import"
};
import type { Bar } from "react-chartjs-2" with {
  "resolution-mode": "import"
};
import LinearProgress from "@mui/material/LinearProgress";

/**
 * Bar chart
 */
export type BarChartProps = {
  /**
   * Chart data
   */
  data: ChartData<"bar">;

  /**
   * Options
   */
  options?: ChartOptions<"bar">;

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
 * Bar chart
 * @param props Props
 * @returns Component
 */
export function BarChart(props: BarChartProps) {
  // Destruct
  const { data, options, subtitle, title } = props;

  // State
  const [BarType, setBarType] = React.useState<typeof Bar>();

  React.useEffect(() => {
    Promise.all([
      import("react-chartjs-2"),
      import("chart.js"),
      import("chartjs-plugin-datalabels")
    ]).then(
      ([
        { Bar },
        {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          BarElement,
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
          BarElement,
          Title,
          Tooltip,
          Legend,

          ChartDataLabels as any // CommonJS says 'id' is missing
        );

        setBarType(Bar);
      }
    );
  }, []);

  return BarType == null ? (
    <LinearProgress />
  ) : (
    <BarType
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
