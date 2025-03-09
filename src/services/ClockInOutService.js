import { db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  Timestamp,
} from "firebase/firestore";

/**
 * Stores clock-in data for a user in Firestore on a daily basis.
 * @param {string} userId - The user's ID.
 */
export const clockInUser = async (userId) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const userDocRef = doc(db, "users", userId);
  const attendanceDocRef = doc(collection(userDocRef, "attendance"), today);

  try {
    const docSnap = await getDoc(attendanceDocRef);

    if (!docSnap.exists()) {
      await setDoc(attendanceDocRef, {
        date: today,
        clockInTime: serverTimestamp(),
        clockOutTime: null,
        workDuration: null,
        status: "Present",
        onTimeOrLate: isOnTime(),
      });

      console.log("Clock-in successful:", today);
      return { success: true, message: "Clock-in successful" };
    } else {
      throw new Error("Already clocked in for today.");
    }
  } catch (error) {
    console.error("Clock-in error:", error.message);
    throw new Error(error.message);
  }
};

/**
 * Updates clock-out time and calculates work duration.
 * @param {string} userId - The user's ID.
 */
export const clockOutUser = async (userId) => {
  const today = new Date().toISOString().split("T")[0];
  const userDocRef = doc(db, "users", userId);
  const attendanceDocRef = doc(collection(userDocRef, "attendance"), today);

  try {
    const docSnap = await getDoc(attendanceDocRef);

    if (!docSnap.exists()) {
      throw new Error("No clock-in record found for today.");
    }

    const data = docSnap.data();

    if (data.clockOutTime) {
      throw new Error("Already clocked out for today.");
    }

    const clockOutTime = new Date();
    const clockInTime = data.clockInTime instanceof Timestamp 
      ? data.clockInTime.toDate() 
      : null;

    if (!clockInTime) {
      throw new Error("Clock-in time is missing or invalid.");
    }

    // Calculate work duration in hours
    const duration = ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2);

    await updateDoc(attendanceDocRef, {
      clockOutTime: serverTimestamp(),
      workDuration: duration,
    });

    console.log("Clock-out successful:", { clockOutTime, workDuration: duration });

    return { success: true, clockOutTime, workDuration: duration };
  } catch (error) {
    console.error("Clock-out error:", error.message);
    throw new Error(error.message);
  }
};

/**
 * Fetches the attendance data for a user by date.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object|null>} - Attendance record for today.
 */
export const getUserAttendance = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const userDocRef = doc(db, "users", userId);
    const attendanceDocRef = doc(collection(userDocRef, "attendance"), today);
    const docSnap = await getDoc(attendanceDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        clockInTime: data.clockInTime instanceof Timestamp ? data.clockInTime.toDate() : null,
        clockOutTime: data.clockOutTime instanceof Timestamp ? data.clockOutTime.toDate() : null,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return null;
  }
};

/**
 * Checks if the user clocked in on time (before 9:00 AM).
 * @returns {boolean} - Returns true if clock-in is before 9 AM.
 */
const isOnTime = () => {
  return new Date().getHours() < 9;
};
