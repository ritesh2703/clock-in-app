import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Stores clock-in data for a user in Firestore.
 * @param {string} userId - The user's ID.
 * @param {string} userName - The user's name or email.
 */
export const clockInUser = async (userId, userName) => {
  const userDocRef = doc(db, "attendance", userId);

  await setDoc(userDocRef, {
    uid: userId,
    name: userName,
    clockInTime: serverTimestamp(),
    clockOutTime: null,
    workDuration: null,
  });
};

/**
 * Updates clock-out time and calculates work duration.
 * @param {string} userId - The user's ID.
 * @param {Date} clockInTime - The clock-in timestamp.
 */
export const clockOutUser = async (userId, clockInTime) => {
  const userDocRef = doc(db, "attendance", userId);
  const clockOutTime = new Date();

  if (clockInTime) {
    const duration = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Convert ms to hours

    await updateDoc(userDocRef, {
      clockOutTime: serverTimestamp(),
      workDuration: duration.toFixed(2),
    });

    return { clockOutTime, workDuration: duration.toFixed(2) };
  }
};

/**
 * Fetches the latest clock-in/out data for a user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} - User's attendance data.
 */
export const getUserAttendance = async (userId) => {
  const userDocRef = doc(db, "attendance", userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
};
/**
 * Fetches all users' attendance records.
 * @returns {Promise<Array>} - Array of attendance records.
 */
export const getAllAttendanceRecords = async () => {
  const attendanceCollectionRef = collection(db, "attendance");
  const snapshot = await getDocs(attendanceCollectionRef);

  const attendanceRecords = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return attendanceRecords;
};