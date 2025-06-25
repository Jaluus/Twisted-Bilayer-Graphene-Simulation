"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAppSelector } from "@/lib/hooks";
import { selectBandStructure } from "@/app/slices/bandstructureSlice";
import { useEffect, useState } from "react";
import { Link, RefreshCw } from "lucide-react";

const chartConfig = {};

const labels: { [key: string]: string } = {
  "0": "K'",
  "20": "K",
  "40": "Γ",
  "60": "M",
  "79": "K'",
};

interface BMChartProps {
  loading: boolean;
  error: boolean;
}

export function BMChart({ loading, error }: BMChartProps) {
  const chartData = useAppSelector(selectBandStructure);
  const maxNumTicks = 7; // Maximum number of ticks to display
  const [ticks, setTicks] = useState<number[]>([
    -300, -200, -100, 0, 100, 200, 300,
  ]);

  // Update ticks based on chart data
  useEffect(() => {
    let all_max_values = chartData.map((item) => {
      const { x, ...rest } = item;
      return Math.max(...Object.values(rest)) || 0;
    });
    let all_min_values = chartData.map((item) => {
      const { x, ...rest } = item;
      return Math.min(...Object.values(rest)) || 0;
    });
    let max_value = Math.max(...all_max_values);
    let min_value = Math.min(...all_min_values);
    let max_abs_value = Math.max(Math.abs(max_value), Math.abs(min_value));
    max_abs_value = Math.ceil(max_abs_value / 100) * 100;

    let tick_step =
      Math.ceil(max_abs_value / ((maxNumTicks - 1) / 2) / 100) * 100;
    console.log(tick_step, max_abs_value, maxNumTicks);

    setTicks([
      tick_step * -3,
      tick_step * -2,
      tick_step * -1,
      0,
      tick_step,
      tick_step * 2,
      tick_step * 3,
    ]);
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Band Structure (meV)</CardTitle>
        <CardDescription>
          <a
            href="https://www.pnas.org/doi/10.1073/pnas.2307151120"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer"
          >
            <Link className="inline w-3 h-3" /> Bistritzer-MacDonald Model
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer
            config={chartConfig}
            className="w-full h-full aspect-square"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 0,
                right: 1,
                top: 1,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={"x"}
                tickLine={true}
                axisLine={true}
                tickFormatter={(value) => labels[value] ?? ""}
                tickMargin={8}
                ticks={["0", "20", "40", "60", "79"]}
                domain={[0, 79]}
                type="number"
              />
              <YAxis
                tickLine={true}
                axisLine={true}
                tickMargin={8}
                ticks={ticks}
                tickFormatter={(value) => `${value}`}
                tickCount={ticks.length}
                domain={[-Math.max(...ticks), Math.max(...ticks)]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="B6"
                type="natural"
                stroke="#f0b100"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="B5"
                type="natural"
                stroke="#f0b100"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="B4"
                type="natural"
                stroke="#f0b100"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="B3"
                type="natural"
                stroke="#f0b100"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="B2"
                type="natural"
                stroke="#f0b100"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="B1"
                type="natural"
                stroke="#f0b100"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center opacity-50 rounded-sm">
              <div className="flex flex-col items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <div className="text-lg font-medium">Diagonalizing...</div>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-red-50/90 dark:bg-red-950/90 flex items-center justify-center rounded-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div className="text-lg font-medium text-red-900 dark:text-red-100">
                  Oops, something went wrong!
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Please reload the page to try again
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
