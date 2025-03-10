import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { auth } from "../firebase/firebase";
import { getWeeklyAttendance } from "../services/attendanceService"; // Adjust the import path

const AttendanceGraph = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchAttendanceData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAttendanceData = async (userId) => {
    try {
      setLoading(true);
      setError("");
      const data = await getWeeklyAttendance(userId);
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to load attendance data. Please check your network or permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Custom colors for bars based on status
  const getBarColor = (status) => {
    switch (status) {
      case "present":
        return "#22c55e"; // Green
      case "absent":
        return "#ef4444"; // Red
      case "holiday":
        return "#3b82f6"; // Blue
      default:
        return "#22c55e"; // Default to green
    }
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-indigo-700 text-center">Weekly Attendance</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading attendance data...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : attendanceData.length === 0 ? (
        <p className="text-center text-gray-500">No attendance data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip
              formatter={(value, name, props) => [
                `Work Duration: ${props.payload.workDuration} hrs`,
                `Clock In: ${props.payload.clockIn} | Clock Out: ${props.payload.clockOut}`,
              ]}
            />
            <Bar dataKey="workDuration">
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceGraph;