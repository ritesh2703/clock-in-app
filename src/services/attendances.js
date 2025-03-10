import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import axios from "axios"; // Ensure axios is installed and imported

/**
 * Fetches holidays for a specific month and year using the Calendarific API.
 * @param {number} year - The year (e.g., 2025).
 * @param {number} month - The month (1-12).
 * @returns {Promise<Array>} - Array of holidays for the specified month and year.
 */
const fetchHolidays = async (year, month) => {
  try {
    const API_KEY = "ldyQy15cZA3z12xU633ZBLkiTHgPrQKf";
    const response = await axios.get(
      `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=IN&year=${year}&month=${month}`
    );

    const holidays = response.data.response.holidays.map((holiday) => ({
      date: holiday.date.iso, // Format: "YYYY-MM-DD"
      name: holiday.name,
    }));

    return holidays;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
};

/**
 * Fetches attendance data for a user for a specific month and year.
 * @param {string} userId - The user's ID.
 * @param {number} month - The month (1-12).
 * @param {number} year - The year (e.g., 2025).
 * @returns {Promise<Array>} - Array of attendance data for the specified month and year.
 */
export const getAttendanceData = async (userId, month, year) => {
  try {
    console.log("Fetching attendance for user:", userId); // Debug userId
    if (!userId) {
      throw new Error("User ID is undefined or invalid.");
    }

    const userRef = doc(db, "users", userId);
    console.log("User Ref Path:", userRef.path); // Debug userRef path

    const attendanceRef = collection(userRef, "attendance");
    console.log("Attendance Ref Path:", attendanceRef.path); // Debug attendanceRef path

    // Calculate start and end dates for the selected month and year
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]; // YYYY-MM-DD
    const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Last day of the month

    // Query attendance data for the selected month and year
    const q = query(
      attendanceRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );

    const querySnapshot = await getDocs(q);
    const attendanceData = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const clockInTime = data.clockInTime ? data.clockInTime.toDate() : null;
      const clockOutTime = data.clockOutTime ? data.clockOutTime.toDate() : null;

      // Calculate work duration in hours
      const workDuration =
        clockInTime && clockOutTime
          ? ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2)
          : null;

      attendanceData.push({
        id: doc.id, // Include the document ID
        date: data.date,
        username: data.username || "--",
        clockInTime,
        clockOutTime,
        workDuration: workDuration || 0, // Default to 0 if no work duration
        status: data.status || "Absent",
      });
    });

    // Fetch holidays for the specified month and year
    const holidays = await fetchHolidays(year, month);

    // Fill in missing days with default values or mark as holiday
    const daysOfMonth = [];
    for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
      const date = new Date(year, month - 1, i).toISOString().split("T")[0]; // YYYY-MM-DD
      const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.some((holiday) => holiday.date === date);

      const existingData = attendanceData.find((d) => d.date === date);

      daysOfMonth.push(
        existingData || {
          id: `generated-${date}`, // Generate a unique ID for missing entries
          date,
          username: "--",
          clockInTime: null,
          clockOutTime: null,
          workDuration: 0,
          status: isHoliday ? "Holiday" : isWeekend ? "Weekend" : "Absent",
        }
      );
    }

    return daysOfMonth;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};

/**
 * Updates an attendance entry in Firestore.
 * @param {string} entryId - The ID of the attendance entry to update.
 * @param {string} clockInTime - The new clock-in time.
 * @param {string} clockOutTime - The new clock-out time.
 * @returns {Promise<void>}
 */
export const updateAttendanceEntry = async (entryId, clockInTime, clockOutTime) => {
  try {
    const attendanceRef = doc(db, "attendance", entryId); // Reference the document
    await updateDoc(attendanceRef, {
      clockInTime,
      clockOutTime,
    });
    console.log("Attendance entry updated successfully");
  } catch (error) {
    console.error("Error updating attendance entry:", error);
    throw error;
  }
};