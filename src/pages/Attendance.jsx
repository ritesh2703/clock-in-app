import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { db } from "../firebase/firebase"; // Import Firestore instance
import { collection, getDocs } from "firebase/firestore";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const attendanceRef = collection(db, "attendance"); // Reference Firestore collection
      const querySnapshot = await getDocs(attendanceRef);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      processAttendanceData(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const processAttendanceData = (data) => {
    const updatedData = data.map((entry) => {
      const clockIn = entry.clockInTime?.seconds
        ? new Date(entry.clockInTime.seconds * 1000)
        : null;
      const clockOut = entry.clockOutTime?.seconds
        ? new Date(entry.clockOutTime.seconds * 1000)
        : null;

      let status = "On Time";
      let workingHours = 0;

      if (!clockIn) {
        status = "Absent";
      } else {
        if (clockIn.getHours() > 9 || (clockIn.getHours() === 9 && clockIn.getMinutes() > 30)) {
          status = "Late";
        }

        if (clockOut) {
          workingHours = ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2);
        }
      }

      return { ...entry, clockIn, clockOut, status, workingHours };
    });

    setAttendanceData(updatedData);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Timesheet</h2>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Clock In</th>
              <th className="p-3 border">Clock Out</th>
              <th className="p-3 border">Working Hours</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Edit</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((entry, index) => (
              <tr key={index} className={`text-center ${entry.status === "Absent" ? "bg-red-100 text-red-600" : ""}`}>
                <td className="p-3 border">{entry.clockIn?.toLocaleDateString() || "--"}</td>
                <td className="p-3 border">{entry.clockIn?.toLocaleTimeString() || "--"}</td>
                <td className="p-3 border">{entry.clockOut?.toLocaleTimeString() || "--"}</td>
                <td className="p-3 border">{entry.workingHours || "--"} hrs</td>
                <td className={`p-3 border font-bold ${entry.status === "Late" ? "text-red-500" : "text-green-500"}`}>
                  {entry.status}
                </td>
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
    </div>
  );
};

export default Attendance;
