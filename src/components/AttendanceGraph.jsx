import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from "recharts";
import { auth } from "../firebase/firebase";

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

  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    const statusColors = {
      present: "#22c55e", // Green
      absent: "#ef4444", // Red
      weekend: "#3b82f6", // Blue
    };

    return <Dot cx={cx} cy={cy} r={6} fill={statusColors[payload.status] || "#22c55e"} />;
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
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={attendanceData}>
            <XAxis dataKey="day" />
            <YAxis hide />
            <Tooltip formatter={(value, name, props) => [`Clock In: ${props.payload.clockIn || "--"} | Clock Out: ${props.payload.clockOut || "--"}`, "Time"]} />
            <Line type="monotone" dataKey="clockIn" stroke="#22c55e" dot={renderCustomDot} />
            <Line type="monotone" dataKey="clockOut" stroke="#f97316" dot={renderCustomDot} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceGraph;
