// src/firebase/attendanceService.js
import { db } from "./firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

/**
 * Fetch weekly attendance data for a specific user.
 * @param {string} userId - The authenticated user's UID.
 * @returns {Promise<Array>} - Returns an array of attendance records.
 */
export const getWeeklyAttendance = async (userId) => {
  try {
    const attendanceCollection = collection(db, "attendance");
    const q = query(attendanceCollection, where("userId", "==", userId), orderBy("date", "asc"));
    
    const querySnapshot = await getDocs(q);
    const attendanceData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return attendanceData;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw new Error("Failed to fetch attendance data.");
  }
};
