"use client";

interface DataPoint {
  name: string;
  value: number;
  averageScore?: number;
  color?: string;
}

interface PieChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export function PieChart({ data, width = 300, height = 300 }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
  ];

  let currentAngle = -90; // Start from top

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    // Calculate label position
    const labelAngle = (startAngle + endAngle) / 2;
    const labelAngleRad = (labelAngle * Math.PI) / 180;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngleRad);
    const labelY = centerY + labelRadius * Math.sin(labelAngleRad);

    currentAngle = endAngle;

    const color = item.color || colors[index % colors.length];

    return {
      ...item,
      pathData,
      color,
      percentage: Math.round(percentage * 10) / 10,
      labelX,
      labelY,
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="w-full h-full flex items-center">
      <div className="flex-1">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          {/* Pie slices */}
          {slices.map((slice, index) => (
            <g key={`slice-${slice.name}-${index}`}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="#ffffff"
                strokeWidth={2}
                className="hover:opacity-80 cursor-pointer"
              >
                <title>
                  {slice.name}: {slice.value} ({slice.percentage}%)
                  {slice.averageScore
                    ? `\nAverage Score: ${slice.averageScore}%`
                    : ""}
                </title>
              </path>

              {/* Labels for larger slices */}
              {slice.percentage > 10 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#ffffff"
                  fontWeight="600"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                >
                  {slice.percentage}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="ml-4 space-y-2">
        {slices.map((slice, index) => (
          <div
            key={`legend-${slice.name}-${index}`}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />
            <div className="flex-1">
              <div className="font-medium">{slice.name}</div>
              <div className="text-gray-500">
                {slice.value} ({slice.percentage}%)
                {slice.averageScore && (
                  <div className="text-xs">Avg: {slice.averageScore}%</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
