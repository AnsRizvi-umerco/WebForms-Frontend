import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { chartInbound, chartOutbound, docMixPieColor } from "@/components/umerco/styles";
import { outboundDocumentLabel } from "@/lib/document-types";

type TrendPoint = {
  bucketKey: string;
  label: string;
  inbound: number;
  outbound: number;
};

type DocMixPoint = {
  name: string;
  value: number;
};

const chartFontFamily = "Lexend Deca, -apple-system, BlinkMacSystemFont, sans-serif";

const baseChartOptions: Pick<ApexOptions, "chart" | "grid" | "tooltip" | "legend" | "dataLabels"> = {
  chart: {
    fontFamily: chartFontFamily,
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  grid: {
    borderColor: "#e8eaed",
    strokeDashArray: 4
  },
  tooltip: {
    theme: "light"
  },
  legend: {
    fontSize: "12px",
    fontWeight: 500,
    labels: { colors: "#6b7280" }
  },
  dataLabels: { enabled: false }
};

export function TransactionTrendChart({ data }: { data: TrendPoint[] }) {
  const options: ApexOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: "bar"
    },
    colors: [chartInbound, chartOutbound],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "52%"
      }
    },
    xaxis: {
      categories: data.map((point) => point.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#6b7280", fontSize: "11px" }
      }
    },
    yaxis: {
      labels: {
        style: { colors: "#6b7280", fontSize: "11px" }
      }
    },
    series: [
      { name: "Inbound", data: data.map((point) => point.inbound) },
      { name: "Outbound", data: data.map((point) => point.outbound) }
    ]
  };

  if (data.length === 0) {
    return <ChartEmptyState message="No transaction trend data for this range." />;
  }

  return (
    <Chart
      options={options}
      series={options.series}
      type="bar"
      height="100%"
      width="100%"
    />
  );
}

export function DocMixChart({ data }: { data: DocMixPoint[] }) {
  const colors = data.map((entry) => docMixPieColor(entry.name));

  const options: ApexOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: "donut"
    },
    colors,
    labels: data.map((entry) => outboundDocumentLabel(entry.name)),
    stroke: {
      width: 2,
      colors: ["#ffffff"]
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Documents",
              color: "#6b7280",
              fontSize: "12px",
              fontWeight: 500
            }
          }
        }
      }
    },
    series: data.map((entry) => entry.value)
  };

  if (data.length === 0) {
    return <ChartEmptyState message="No outbound document mix for this range." />;
  }

  return (
    <Chart
      options={options}
      series={options.series}
      type="donut"
      height="100%"
      width="100%"
    />
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[14rem] items-center justify-center rounded-lg border border-dashed border-umerco-border bg-umerco-canvas/40 px-4 text-center text-sm text-umerco-muted">
      {message}
    </div>
  );
}
