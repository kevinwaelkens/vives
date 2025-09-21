"use client";

interface DataPoint {
  x: number;
  y: number;
  label?: string;
  date?: string;
}

interface LineChartProps {
  data: DataPoint[];
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
}

export function LineChart({
  data,
  xLabel = "X",
  yLabel = "Y",
  width = 400,
  height = 200,
}: LineChartProps) {
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

  const maxX = Math.max(...data.map((d) => d.x));
  const minX = Math.min(...data.map((d) => d.x));
  const maxY = Math.max(...data.map((d) => d.y), 100); // Ensure at least 100 for percentage scores
  const minY = Math.min(...data.map((d) => d.y), 0);

  const scaleX = (x: number) =>
    ((x - minX) / (maxX - minX)) * chartWidth + padding;
  const scaleY = (y: number) =>
    height - (((y - minY) / (maxY - minY)) * chartHeight + padding);

  // Create path for the line
  const pathData = data
    .map((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Generate grid lines
  const gridLines = [];
  const numGridLines = 5;

  // Horizontal grid lines
  for (let i = 0; i <= numGridLines; i++) {
    const y = padding + (i * chartHeight) / numGridLines;
    const value = maxY - (i * (maxY - minY)) / numGridLines;
    gridLines.push(
      <g key={`h-${i}`}>
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
      </g>,
    );
  }

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {gridLines}

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

        {/* Data line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => (
          <g key={`point-${point.x}-${index}`}>
            <circle
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={4}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth={2}
            />
            {/* Tooltip on hover */}
            <circle
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={8}
              fill="transparent"
              className="hover:fill-blue-100 cursor-pointer"
            >
              <title>
                {point.label ? `${point.label}\n` : ""}
                {point.date ? `Date: ${point.date}\n` : ""}
                Score: {point.y}%
              </title>
            </circle>
          </g>
        ))}

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
