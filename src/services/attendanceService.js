import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import axios from "axios"; // Ensure axios is installed and imported

/**
 * Fetches holidays for the current week using the Calendarific API.
 * @returns {Promise<Array>} - Array of holidays for the current week.
 */
const fetchHolidays = async () => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Include today and the last 6 days

    const response = await axios.get(
      `https://calendarific.com/api/v2/holidays?api_key=YOUR_API_KEY&country=IN&year=${today.getFullYear()}`
    );

    const holidays = response.data.response.holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date.iso);
      return holidayDate >= sevenDaysAgo && holidayDate <= today;
    });

    return holidays;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
};

/**
 * Fetches the last 7 days of attendance data for a user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Array>} - Array of attendance data for the last 7 days.
 */
export const getWeeklyAttendance = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const attendanceCollectionRef = collection(userDocRef, "attendance");

  // Get the current date and the date 7 days ago
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // Include today and the last 6 days

  // Query attendance data for the last 7 days
  const q = query(
    attendanceCollectionRef,
    where("date", ">=", sevenDaysAgo.toISOString().split("T")[0]),
    where("date", "<=", today.toISOString().split("T")[0])
  );

  try {
    const querySnapshot = await getDocs(q);
    const attendanceData = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const clockInTime = data.clockInTime ? new Date(data.clockInTime.toDate()) : null;
      const clockOutTime = data.clockOutTime ? new Date(data.clockOutTime.toDate()) : null;

      // Calculate work duration in hours
      const workDuration = clockInTime && clockOutTime ? ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2) : null;

      attendanceData.push({
        day: `${new Date(data.date).toLocaleDateString("en-US", { weekday: "short" })} (${new Date(data.date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })})`, // Format: "Sun (09/03)"
        clockIn: clockInTime ? clockInTime.toLocaleTimeString() : "--",
        clockOut: clockOutTime ? clockOutTime.toLocaleTimeString() : "--",
        workDuration: workDuration || 0, // Default to 0 if no work duration
        status: data.status.toLowerCase(),
      });
    });

    // Fetch holidays for the current week
    const holidays = await fetchHolidays();

    // Fill in missing days with default values or mark as holiday
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const day = `${date.toLocaleDateString("en-US", { weekday: "short" })} (${date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })})`;
      const existingData = attendanceData.find((d) => d.day === day);

      // Check if the day is a holiday
      const isHoliday = holidays.some((holiday) => holiday.date.iso === date.toISOString().split("T")[0]);

      daysOfWeek.push(
        existingData || {
          day,
          clockIn: isHoliday ? "Holiday" : "--",
          clockOut: isHoliday ? "Holiday" : "--",
          workDuration: 0, // No work duration for absent/holiday days
          status: isHoliday ? "holiday" : "absent",
        }
      );
    }

    return daysOfWeek;
  } catch (error) {
    console.error("Error fetching weekly attendance:", error);
    throw error;
  }
};
/**
 * Fetches attendance data for a user for a specific month and year.
 * @param {string} userId - The user's ID.
 * @param {number} month - The month (1-12).
 * @param {number} year - The year (e.g., 2025).
 * @returns {Promise<Array>} - Array of attendance data.
 */
export const getUserAttendance = async (userId, month, year) => {
  const userRef = doc(db, "users", userId);
  const attendanceRef = collection(userRef, "attendance");

  // Calculate start and end dates for the selected month and year
  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]; // YYYY-MM-DD
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Last day of the month

  // Query attendance data for the selected month and year
  const q = query(
    attendanceRef,
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );

  try {
    const querySnapshot = await getDocs(q);
    const attendanceData = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      attendanceData.push({
        date: data.date,
        username: data.username || "--",
        clockInTime: data.clockInTime ? data.clockInTime.toDate() : null,
        clockOutTime: data.clockOutTime ? data.clockOutTime.toDate() : null,
        status: data.status || "Absent",
      });
    });

    return attendanceData;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};