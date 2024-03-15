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

export default function DashboardChart({ data, width, height }) {
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
        fill={
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "#FFFFFF"
            : "#000000"
        }
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;

    return (
      <ul className="w-32">
        {payload.map((entry, index) => (
          <div key={`item-${index}`}>
            <li className={`text-[${entry.color}]`}>&#9632; {entry.value}</li>
          </div>
        ))}
      </ul>
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
      <div
        className={`h-[400px] w-5/6 bg-neutral-50 dark:bg-neutral-600  flex justify-center items-center`}
      >
        <div className="italic text-black dark:text-white">No data to show</div>
      </div>
    );
  }
  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart className="bg-neutral-50 dark:bg-neutral-600">
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={"70%"}
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
            <div className="w-32 text-xs text-wrap">{entry.payload.name}</div>
          )}
          // content={renderLegend}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

DashboardChart.propTypes = {
  data: PropTypes.array,
};
