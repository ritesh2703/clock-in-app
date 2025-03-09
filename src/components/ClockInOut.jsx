import React, { useState, useEffect } from "react";
import axios from "axios";
import AttendanceGraph from "./AttendanceGraph";
import { auth } from "../firebase/firebase";
import {
  clockInUser,
  clockOutUser,
  getUserAttendance,
} from "../services/ClockInOutService";

const ClockInOut = () => {
  const [time, setTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [workDuration, setWorkDuration] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [holidays, setHolidays] = useState([]);
  const [showAllHolidays, setShowAllHolidays] = useState(false);
  const [user, setUser] = useState(null);

  // Get the authenticated user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const attendanceData = await getUserAttendance(currentUser.uid);

        if (attendanceData) {
          const today = new Date().toDateString();
          const clockInToday =
            attendanceData.clockInTime &&
            new Date(attendanceData.clockInTime).toDateString() === today;
          const clockOutToday =
            attendanceData.clockOutTime &&
            new Date(attendanceData.clockOutTime).toDateString() === today;

          setClockInTime(clockInToday ? new Date(attendanceData.clockInTime) : null);
          setClockOutTime(clockOutToday ? new Date(attendanceData.clockOutTime) : null);
          setWorkDuration(attendanceData.workDuration);
          setIsClockedIn(clockInToday && !clockOutToday);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isClockedIn && clockInTime) {
      const startTime = Math.floor((new Date() - clockInTime) / 1000);
      setElapsedTime(startTime);

      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isClockedIn, clockInTime]);

  // Fetch upcoming holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(
          `https://calendarific.com/api/v2/holidays?api_key=cXDbYg3T2XzdVEEG5vY8oX0s4NitT39F&country=IN&year=${new Date().getFullYear()}`
        );
        const today = new Date().toISOString().split("T")[0];
        const upcomingHolidays = response.data.response.holidays.filter(
          (holiday) => holiday.date.iso >= today
        );
        setHolidays(upcomingHolidays);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };
    fetchHolidays();
  }, []);

  const handleClockInOut = async () => {
    if (!user) return;

    const today = new Date().toDateString();

    if (!isClockedIn) {
      try {
        const result = await clockInUser(user.uid);
        if (result.success) {
          setClockInTime(result.clockInTime);
          setElapsedTime(0);
          setIsClockedIn(true);
          alert("Clocked in successfully!");
        }
      } catch (error) {
        alert(error.message); // Show error message to the user
      }
    } else {
      try {
        const result = await clockOutUser(user.uid);
        if (result) {
          setClockOutTime(result.clockOutTime);
          setWorkDuration(result.workDuration);
          setIsClockedIn(false);
          alert("Clocked out successfully!");
        }
      } catch (error) {
        alert(error.message); // Show error message to the user
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Column: Clock In/Out */}
        <div className="bg-white p-6 shadow-lg rounded-lg text-center">
          <h2 className="text-xl font-bold text-blue-700">Timesheet</h2>
          <div className="relative flex items-center justify-center my-4">
            <div className="w-32 h-32 border-8 border-blue-500 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">
                {isClockedIn
                  ? new Date(elapsedTime * 1000).toISOString().substr(11, 8)
                  : time.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <p className="text-gray-600">{isClockedIn ? "Clocked In" : "Clocked Out"}</p>
          <p className="text-sm text-gray-500">
            {clockInTime && `Clock In: ${clockInTime.toLocaleTimeString()}`}
          </p>
          <p className="text-sm text-gray-500">
            {clockOutTime && `Clock Out: ${clockOutTime.toLocaleTimeString()}`}
          </p>
          <button
            className={`mt-4 px-6 py-2 text-white rounded-lg ${
              isClockedIn ? "bg-red-500" : "bg-blue-600"
            }`}
            onClick={handleClockInOut}
          >
            {isClockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>

        {/* Second Column: Weekly Attendance Graph */}
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold text-green-700">Weekly Attendance</h2>
          <AttendanceGraph userId={user?.uid} />
        </div>
      </div>

      {/* Second Row: Work Duration & Live Date/Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-lg rounded-lg text-center">
          <h2 className="text-xl font-bold text-purple-700">Today's Work Hours</h2>
          <p className="text-2xl font-semibold">{workDuration ? `${workDuration} hrs` : "--"}</p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-lg text-center">
          <h2 className="text-xl font-bold text-green-700">Live Date & Time</h2>
          <p className="text-lg font-semibold">{time.toLocaleDateString()}</p>
          <p className="text-lg font-semibold">{time.toLocaleTimeString()}</p>
          <p className="text-md text-gray-500">{time.toLocaleDateString('en-US', { weekday: 'long' })}</p>
        </div>
      </div>

      {/* Upcoming Holidays */}
      <div className="bg-white p-6 shadow-lg rounded-lg max-h-60 overflow-y-auto">
        <h2 className="text-xl font-bold text-red-700">Upcoming Holidays</h2>
        <ul className="mt-4">
          {(showAllHolidays ? holidays : holidays.slice(0, 3)).map((holiday, index) => (
            <li key={index} className="py-2 border-b">
              <span className="font-semibold">{holiday.date.iso} - {holiday.name}</span>
            </li>
          ))}
        </ul>
        {holidays.length > 3 && (
          <button
            className="mt-4 text-blue-500"
            onClick={() => setShowAllHolidays(!showAllHolidays)}
          >
            {showAllHolidays ? "See Less" : "See More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClockInOut;