import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { getUserAttendance } from "../services/ClockInOutService";

const Attendance = ({ userId }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, holidays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await getUserAttendance(userId);
      if (data) {
        processAttendanceData(data);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = (data) => {
    let presentCount = 0;
    let absentCount = 0;
    let holidayCount = 0;

    const updatedData = Object.entries(data).map(([date, entry]) => {
      let status = "On Time";
      let clockInTime = entry.clockInTime ? new Date(entry.clockInTime.seconds * 1000) : null;

      if (!entry.clockInTime) {
        status = "Absent";
        absentCount++;
      } else {
        presentCount++;
      }

      return { date, ...entry, status };
    });

    setAttendanceData(updatedData);
    setSummary({ present: presentCount, absent: absentCount, holidays: holidayCount });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">Attendance Timesheet</h2>
      {loading ? (
        <p className="text-center text-lg">Loading attendance data...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Clock In</th>
                <th className="p-3 border">Clock Out</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Edit</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((entry, index) => (
                <tr key={index} className="text-center">
                  <td className="p-3 border">{entry.date}</td>
                  <td className="p-3 border">{entry.clockInTime ? entry.clockInTime.toLocaleTimeString() : "--"}</td>
                  <td className="p-3 border">{entry.clockOutTime || "--"}</td>
                  <td className="p-3 border text-green-500">{entry.status}</td>
                  <td className="p-3 border">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;