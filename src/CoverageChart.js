import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const CoverageChart = ({ data, dayLabel }) => {
  return (
    <div style={{ margin: "2rem 0" }}>
      <h3>Coverage for {dayLabel}</h3>
      <AreaChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="required"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorRequired)"
          name="Required"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorActual)"
          name="Actual"
        />
      </AreaChart>
    </div>
  );
};

export default CoverageChart;
