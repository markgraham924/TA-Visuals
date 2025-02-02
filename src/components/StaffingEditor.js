import React, { useState, useEffect } from "react";

const StaffingEditor = () => {
  const [staffSchedules, setStaffSchedules] = useState([]);

  // Fetch the JSON data on component mount
  useEffect(() => {
    fetch("/staff_schedule.json")
 // Update the path to the new JSON file
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setStaffSchedules(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Handle updates to the schedule
  const handleInputChange = (colleagueIndex, dayKey, field, value) => {
    const updatedSchedules = [...staffSchedules];
    if (!updatedSchedules[colleagueIndex].Schedule[dayKey]) {
      updatedSchedules[colleagueIndex].Schedule[dayKey] = { start: "", end: "" };
    }
    updatedSchedules[colleagueIndex].Schedule[dayKey][field] = value;
    setStaffSchedules(updatedSchedules);
  };

  // Save the updated data (e.g., send to a server or download as JSON)
  const handleSave = () => {
    console.log("Updated Schedules:", JSON.stringify(staffSchedules, null, 2));
    alert("Schedules saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Staffing Schedule Editor</h1>
      {staffSchedules.map((staff, index) => (
        <div key={index} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>{staff.Colleague}</h2>
          <p>Line Manager: {staff["Line Manager"]}</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(staff.Schedule).map((dayKey) => (
                <tr key={dayKey}>
                  <td>{dayKey}</td>
                  <td>
                    <input
                      type="time"
                      value={staff.Schedule[dayKey]?.start || ""}
                      onChange={(e) =>
                        handleInputChange(index, dayKey, "start", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={staff.Schedule[dayKey]?.end || ""}
                      onChange={(e) =>
                        handleInputChange(index, dayKey, "end", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={handleSave} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Save Schedules
      </button>
    </div>
  );
};

export default StaffingEditor;
