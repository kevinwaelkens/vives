"use client";

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
}

export function BarChart({
  data,
  xLabel = "Category",
  yLabel = "Value",
  width = 400,
  height = 200,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = (chartWidth / data.length) * 0.8;
  const barSpacing = (chartWidth / data.length) * 0.2;

  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#06b6d4", // cyan
  ];

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = padding + (i * chartHeight) / 5;
          const value = maxValue - (i * maxValue) / 5;
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={padding - 5}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#374151"
          strokeWidth={2}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#374151"
          strokeWidth={2}
        />

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - padding - barHeight;
          const color = item.color || colors[index % colors.length];

          return (
            <g key={`bar-${item.name}-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={2}
                className="hover:opacity-80 cursor-pointer"
              >
                <title>
                  {item.name}: {item.value}
                </title>
              </rect>

              {/* Value label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
                fontWeight="500"
              >
                {item.value}
              </text>

              {/* Category label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 15}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
                transform={`rotate(-45, ${x + barWidth / 2}, ${height - padding + 15})`}
              >
                {item.name}
              </text>
            </g>
          );
        })}

        {/* Labels */}
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          fontWeight="500"
        >
          {xLabel}
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          fontWeight="500"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          {yLabel}
        </text>
      </svg>
    </div>
  );
}
