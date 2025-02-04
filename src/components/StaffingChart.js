import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const StaffingChart = () => {
  const [staffSchedules, setStaffSchedules] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [demandData, setDemandData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState("Monday Demand");

  // Map of abbreviated to full day names
  const dayMapping = {
    Sun: "Sunday",
    Mon: "Monday",
    Tues: "Tuesday",
    Wed: "Wednesday",
    Thurs: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  };

  // Fetch staff schedules and demand data on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const scheduleResponse = await fetch("/staff_schedule.json");
        if (!scheduleResponse.ok) throw new Error("Failed to fetch staff schedules");
        const schedules = await scheduleResponse.json();
        setStaffSchedules(schedules);
      } catch (error) {
        console.error("Error fetching staff schedules:", error);
      }
    };

    const fetchDemand = async () => {
      try {
        const demandResponse = await fetch("/demand_data_filtered.json");
        if (!demandResponse.ok) throw new Error("Failed to fetch demand data");
        const demand = await demandResponse.json();
        setDemandData(demand);
      } catch (error) {
        console.error("Error fetching demand data:", error);
      }
    };

    fetchSchedules();
    fetchDemand();
  }, []);

  // Generate chart data based on selected week
  const generateChartData = useCallback(() => {
    if (!staffSchedules.length || !demandData.length) return;
  
    const tempDataWeek1 = [];
    const tempDataWeek2 = [];
  
    [1, 2].forEach((week) => {
      demandData.forEach((entry) => {
        const time = entry.Time;
        const [currentHour, currentMinute] = time.split(":").map(Number);
  
        const demandKeys = [
          "Sunday Demand",
          "Monday Demand",
          "Tuesday Demand",
          "Wednesday Demand",
          "Thursday Demand",
          "Friday Demand",
          "Saturday Demand",
        ];
  
        demandKeys.forEach((dayKey) => {
          const dayDemand = entry[dayKey];
          if (dayDemand === null) return;
  
          let totalStaff = 0;
  
          staffSchedules.forEach((staff) => {
            const fullDayName = dayKey.replace(" Demand", "");
            const abbreviatedDayName = Object.keys(dayMapping).find(
              (abbr) => dayMapping[abbr] === fullDayName
            );
            if (!abbreviatedDayName) return;
  
            const scheduleDayKey = `${abbreviatedDayName} ${week}`;
            const daySchedule = staff.Schedule[scheduleDayKey];
  
            if (daySchedule) {
              const [startHour, startMinute] = daySchedule.start.split(":").map(Number);
              const [endHour, endMinute] = daySchedule.end.split(":").map(Number);
  
              if (
                (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
                (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute))
              ) {
                totalStaff++;
              }
            }
          });
  
          const variance = totalStaff - dayDemand;
          const tempData = week === 1 ? tempDataWeek1 : tempDataWeek2;
          tempData.push({
            day: `${dayKey} Week ${week}`,
            hour: time,
            totalStaff,
            demand: dayDemand,
            variance,
          });
        });
      });
    });
  
    setChartData([...tempDataWeek1, ...tempDataWeek2]);
  }, [staffSchedules, demandData, dayMapping]);
  

  return (
    <div style={{ padding: "20px" }}>
      <h1>Staffing Chart</h1>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={generateChartData}>Generate Chart Data Hello World</button>
      </div>
  
      {/* Day Selection */}
      <div style={{ marginBottom: "20px" }}>
        {[
          "Sunday Demand",
          "Monday Demand",
          "Tuesday Demand",
          "Wednesday Demand",
          "Thursday Demand",
          "Friday Demand",
          "Saturday Demand",
        ].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              marginRight: "10px",
              backgroundColor: selectedDay === day ? "#8884d8" : "#f0f0f0",
              color: selectedDay === day ? "white" : "black",
            }}
          >
            {day.replace(" Demand", "")}
          </button>
        ))}
      </div>
  
      {/* Week 1 Chart */}
      <h2>Week 1</h2>
      {chartData.length > 0 ? (
        <LineChart
          width={800}
          height={400}
          data={chartData.filter(
            (d) => d.day.startsWith(selectedDay.replace(" Demand", "")) && d.day.includes("1")
          )}          
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="totalStaff" stroke="#8884d8" name="Total Staff" />
          <Line type="monotone" dataKey="demand" stroke="#82ca9d" name="Demand" />
          {/* <Line type="monotone" dataKey="variance" stroke="#ff7300" name="Variance" /> */}
        </LineChart>
      ) : (
        <p>Loading chart data...</p>
      )}
  
      {/* Week 2 Chart */}
      <h2>Week 2</h2>
      {chartData.length > 0 ? (
        <LineChart
          width={800}
          height={400}
          data={chartData.filter(
            (d) => d.day.startsWith(selectedDay.replace(" Demand", "")) && d.day.includes("2")
          )}
          
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="totalStaff" stroke="#8884d8" name="Total Staff" />
          <Line type="monotone" dataKey="demand" stroke="#82ca9d" name="Demand" />
          {/* <Line type="monotone" dataKey="variance" stroke="#ff7300" name="Variance" /> */}
        </LineChart>
      ) : (
        <p>Loading chart data...</p>
      )}
    </div>
  );
};  

export default StaffingChart;
