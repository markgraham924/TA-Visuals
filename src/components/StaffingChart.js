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
  const [spendData, setSpendData] = useState({
    dailySpend: {},
    weeklySpend: { week1: 0, week2: 0, total: 0 }
  });

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

  // Calculate time interval in hours (assuming 30-minute intervals)
  const calculateTimeInterval = (timeSlots) => {
    if (!timeSlots || timeSlots.length < 2) return 0.5; // Default to 30 minutes
    
    const [hour1, minute1] = timeSlots[0].split(':').map(Number);
    const [hour2, minute2] = timeSlots[1].split(':').map(Number);
    
    const time1InMinutes = hour1 * 60 + minute1;
    const time2InMinutes = hour2 * 60 + minute2;
    
    return (time2InMinutes - time1InMinutes) / 60;
  };

  // Generate chart data based on selected week
  const generateChartData = useCallback(() => {
    if (!staffSchedules.length || !demandData.length) return;
  
    const tempDataWeek1 = [];
    const tempDataWeek2 = [];
    const dailySpendCalculation = {};
    const weeklySpendCalculation = { week1: 0, week2: 0, total: 0 };
    
    // Get time intervals
    const timeSlots = demandData.map(entry => entry.Time);
    const timeIntervalHours = calculateTimeInterval(timeSlots);
  
    [1, 2].forEach((week) => {
      const weekKey = `week${week}`;
      
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
          
          const dayWeekKey = `${dayKey.replace(" Demand", "")} Week ${week}`;
          if (!dailySpendCalculation[dayWeekKey]) {
            dailySpendCalculation[dayWeekKey] = 0;
          }
  
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
  
          // Calculate spend for this time slot (staff × time interval)
          const slotSpend = totalStaff * timeIntervalHours;
          
          // Add to daily spend
          dailySpendCalculation[dayWeekKey] += slotSpend;
          
          // Add to weekly spend
          weeklySpendCalculation[weekKey] += slotSpend;
  
          const variance = totalStaff - dayDemand;
          const tempData = week === 1 ? tempDataWeek1 : tempDataWeek2;
          tempData.push({
            day: dayWeekKey,
            hour: time,
            totalStaff,
            demand: dayDemand,
            variance,
            spend: slotSpend
          });
        });
      });
    });
    
    // Calculate total weekly spend
    weeklySpendCalculation.total = weeklySpendCalculation.week1 + weeklySpendCalculation.week2;
  
    setChartData([...tempDataWeek1, ...tempDataWeek2]);
    setSpendData({
      dailySpend: dailySpendCalculation,
      weeklySpend: weeklySpendCalculation
    });
  }, [staffSchedules, demandData, dayMapping]);
  

  // Render spend summary for the selected day
  const renderDailySpendSummary = () => {
    if (!spendData.dailySpend || Object.keys(spendData.dailySpend).length === 0) {
      return <p>No spend data available</p>;
    }

    const week1DayKey = `${selectedDay.replace(" Demand", "")} Week 1`;
    const week2DayKey = `${selectedDay.replace(" Demand", "")} Week 2`;
    
    return (
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <h3>Daily Spend Summary</h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
            <h4>Week 1</h4>
            <p><strong>{selectedDay.replace(" Demand", "")}:</strong> {spendData.dailySpend[week1DayKey]?.toFixed(2) || 0} hours</p>
          </div>
          <div style={{ padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
            <h4>Week 2</h4>
            <p><strong>{selectedDay.replace(" Demand", "")}:</strong> {spendData.dailySpend[week2DayKey]?.toFixed(2) || 0} hours</p>
          </div>
        </div>
      </div>
    );
  };

  // Render weekly spend summary
  const renderWeeklySpendSummary = () => {
    if (!spendData.weeklySpend) {
      return null;
    }

    return (
      <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#eef6ff", borderRadius: "8px" }}>
        <h3>Weekly Spend Summary</h3>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h4>Week 1 Total</h4>
            <p>{spendData.weeklySpend.week1.toFixed(2)} hours</p>
          </div>
          <div>
            <h4>Week 2 Total</h4>
            <p>{spendData.weeklySpend.week2.toFixed(2)} hours</p>
          </div>
          <div>
            <h4>Total Bi-Weekly Spend</h4>
            <p>{spendData.weeklySpend.total.toFixed(2)} hours</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Staffing Chart</h1>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={generateChartData}>Generate Chart Data</button>
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
      
      {/* Spend Summary for Selected Day */}
      {renderDailySpendSummary()}
  
      {/* Week 1 Chart */}
      <h2>Week 1</h2>
      {chartData.length > 0 ? (
        <>
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
            <Tooltip formatter={(value, name) => [
              name === 'spend' ? `${value.toFixed(2)} hours` : value,
              name === 'spend' ? 'Hours' : name
            ]}/>
            <Legend />
            <Line type="monotone" dataKey="totalStaff" stroke="#8884d8" name="Total Staff" />
            <Line type="monotone" dataKey="demand" stroke="#82ca9d" name="Demand" />
            <Line type="monotone" dataKey="spend" stroke="#ff7300" name="Spend (hours)" />
          </LineChart>
        </>
      ) : (
        <p>Loading chart data...</p>
      )}
  
      {/* Week 2 Chart */}
      <h2>Week 2</h2>
      {chartData.length > 0 ? (
        <>
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
            <Tooltip formatter={(value, name) => [
              name === 'spend' ? `${value.toFixed(2)} hours` : value,
              name === 'spend' ? 'Hours' : name
            ]}/>
            <Legend />
            <Line type="monotone" dataKey="totalStaff" stroke="#8884d8" name="Total Staff" />
            <Line type="monotone" dataKey="demand" stroke="#82ca9d" name="Demand" />
            <Line type="monotone" dataKey="spend" stroke="#ff7300" name="Spend (hours)" />
          </LineChart>
        </>
      ) : (
        <p>Loading chart data...</p>
      )}
      
      {/* Weekly Spend Summary */}
      {renderWeeklySpendSummary()}
    </div>
  );
};  

export default StaffingChart;
