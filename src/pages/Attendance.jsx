import React, { useState, useEffect } from "react";
import { getAttendanceData } from "../services/attendances";
import { auth, db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

const API_KEY = "ldyQy15cZA3z12xU633ZBLkiTHgPrQKf"; // Replace with actual API key

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, holidays: 0, weekends: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userId, setUserId] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null); // Track which entry is being edited
  const [editingField, setEditingField] = useState(null); // Track which field is being edited (clockIn or clockOut)
  const [newClockInTime, setNewClockInTime] = useState("");
  const [newClockOutTime, setNewClockOutTime] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    } else {
      console.warn("No user is logged in.");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAttendance();
      fetchHolidays();
    }
  }, [userId, selectedMonth, selectedYear]);

  const fetchHolidays = async () => {
    try {
      const COUNTRY = "IN"; // Country code (e.g., "IN" for India)
      const response = await fetch(
        `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${COUNTRY}&year=${selectedYear}`
      );
      const data = await response.json();

      if (data.meta.code !== 200) {
        throw new Error("Failed to fetch holidays");
      }

      setHolidays(data.response.holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const fetchAttendance = async () => {
    if (!userId) {
      console.warn("User ID is not available yet.");
      return;
    }

    try {
      setLoading(true);
      const data = await getAttendanceData(userId, selectedMonth, selectedYear);
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
    let weekendCount = 0;

    const updatedData = data.map((entry) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0];
      const holiday = holidays.find((h) => h.date.iso === entryDate);
      let status = entry.status;

      if (status === "Present") presentCount++;
      else if (status === "Absent") absentCount++;
      else if (status === "Weekend") weekendCount++;
      else if (holiday) {
        status = `Holiday (${holiday.name})`;
        holidayCount++;
      }

      const workingHours = calculateWorkingHours(entry.clockInTime, entry.clockOutTime);

      return { ...entry, status, workingHours };
    });

    setAttendanceData(updatedData);
    setSummary({ present: presentCount, absent: absentCount, holidays: holidayCount, weekends: weekendCount });
  };

  const calculateWorkingHours = (clockInTime, clockOutTime) => {
    if (!clockInTime || !clockOutTime) return "--";

    const start = new Date(clockInTime);
    const end = new Date(clockOutTime);
    const diff = end - start; // Difference in milliseconds
    const hours = Math.floor(diff / (1000 * 60 * 60)); // Convert to hours
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes
    const seconds = Math.floor((diff % (1000 * 60)) / 1000); // Remaining seconds

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value));
  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));

  const handleEdit = (entry, field) => {
    setEditingEntryId(entry.id); // Set the entry ID being edited
    setEditingField(field); // Set the field being edited (clockIn or clockOut)
    setNewClockInTime(entry.clockInTime || "");
    setNewClockOutTime(entry.clockOutTime || "");
  };

  const handleSave = async (entryId) => {
    try {
      // Ensure the user is authenticated
      const user = auth.currentUser;
      if (!user) {
        alert("User not authenticated. Please log in.");
        return;
      }

      // Construct the correct Firestore document path
      const attendanceRef = doc(db, "users", userId, "attendance", entryId);

      const updateData = {};

      if (editingField === "clockIn" && newClockInTime) {
        updateData.clockInTime = newClockInTime;
      }

      if (editingField === "clockOut" && newClockOutTime) {
        if (newClockInTime && newClockOutTime <= newClockInTime) {
          alert("Clock Out time must be after Clock In time.");
          return;
        }
        updateData.clockOutTime = newClockOutTime;
      }

      if (Object.keys(updateData).length > 0) {
        await updateDoc(attendanceRef, updateData);
        alert("Attendance updated successfully!");
      }

      setEditingEntryId(null); // Reset editing state
      setEditingField(null); // Reset editing field
      fetchAttendance(); // Refresh data
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update attendance. Please try again.");
    }
  };

  const formatTime = (time) => {
    if (!time) return "--";
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "text-orange-500 font-semibold";
      case "Absent":
        return "text-blue-500 font-semibold";
      case "Weekend":
        return "text-red-500 font-semibold";
      default:
        return status.startsWith("Holiday") ? "text-green-500 font-semibold" : "text-black";
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">Attendance Timesheet</h2>

      {/* Month and Year Filters */}
      <div className="flex justify-center gap-4 mb-6">
        <select value={selectedMonth} onChange={handleMonthChange} className="p-2 border rounded">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select value={selectedYear} onChange={handleYearChange} className="p-2 border rounded">
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={new Date().getFullYear() - 5 + i}>
              {new Date().getFullYear() - 5 + i}
            </option>
          ))}
        </select>
      </div>

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
                <th className="p-3 border">Working Hours</th>
                <th className="p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((entry, index) => (
                <tr key={index} className="text-center">
                  <td className="p-3 border">{entry.date ? new Date(entry.date).toLocaleDateString() : "--"}</td>
                  <td className="p-3 border">
                    {editingEntryId === entry.id && editingField === "clockIn" ? (
                      <input
                        type="time"
                        step="1"
                        value={newClockInTime}
                        onChange={(e) => setNewClockInTime(e.target.value)}
                        className="p-1 border rounded"
                      />
                    ) : (
                      <span onClick={() => handleEdit(entry, "clockIn")} className="cursor-pointer">
                        {formatTime(entry.clockInTime)}
                      </span>
                    )}
                  </td>
                  <td className="p-3 border">
                    {editingEntryId === entry.id && editingField === "clockOut" ? (
                      <input
                        type="time"
                        step="1"
                        value={newClockOutTime}
                        onChange={(e) => setNewClockOutTime(e.target.value)}
                        className="p-1 border rounded"
                      />
                    ) : (
                      <span onClick={() => handleEdit(entry, "clockOut")} className="cursor-pointer">
                        {formatTime(entry.clockOutTime)}
                      </span>
                    )}
                  </td>
                  <td className="p-3 border">{entry.workingHours}</td>
                  <td className={`p-3 border ${getStatusClass(entry.status)}`}>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Save Button for Editing */}
      {editingEntryId && (
        <div className="fixed bottom-10 right-10">
          <button
            onClick={() => handleSave(editingEntryId)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Attendance;