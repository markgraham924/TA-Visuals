import React from "react";

export default function StaffScheduleForm({ staffSchedules, onUpdate }) {
  return (
    <div>
      {staffSchedules.map((staff) => (
        <div key={staff.id} style={styles.staffContainer}>
          <h2>{staff.name}</h2>
          <p>Pattern Length: {staff.patternLength} week(s)</p>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {/* Object.entries to iterate over the rota's keys */}
              {Object.entries(staff.rota).map(([dayKey, times]) => (
                <tr key={dayKey}>
                  <td>{dayKey}</td>
                  <td>
                    <input
                      type="time"
                      value={times.start}
                      onChange={(e) => onUpdate(staff.id, dayKey, "start", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={times.end}
                      onChange={(e) => onUpdate(staff.id, dayKey, "end", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

const styles = {
  staffContainer: {
    marginBottom: "2rem",
    border: "1px solid #ccc",
    padding: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};
