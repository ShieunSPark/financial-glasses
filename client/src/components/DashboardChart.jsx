import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import PropTypes from "prop-types";

export default function DashboardChart({ data }) {
  const COLORS = [
    "#fd7f6f",
    "#7eb0d5",
    "#b2e061",
    "#bd7ebe",
    "#ffb55a",
    "#ffee65",
    "#beb9db",
    "#fdcce5",
    "#8bd3c7",
  ];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    // Logic to place percentages within the pie slices
    // const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={"#DDDDDD"}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 w-full max-w-xs">
          <p className="label text-black text-wrap">{`${
            payload[0].payload.name
          } : $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }

    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-[500px] w-5/6 bg-slate-700  flex justify-center items-center">
        <div className="italic text-[#DDDDDD]">No data to show</div>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="90%" height={500}>
      <PieChart className="bg-slate-700">
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={"70%"}
          fill="#8884d8"
          label={renderCustomizedLabel}
          legendType="square"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          offset={0}
          formatter={(value, name, props) => [
            `$${value.toFixed(2)}`,
            `${props.payload.name}`,
          ]}
          content={<CustomTooltip />}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value, entry, index) => (
            <div className="w-24 text-xs text-wrap">{entry.payload.name}</div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

DashboardChart.propTypes = {
  data: PropTypes.array,
};
