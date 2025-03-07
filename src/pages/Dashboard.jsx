import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { auth } from "../firebase/firebase";
import DefaultProfile from "../img/default-profile.png";
import { FaHome, FaCalendarAlt, FaClipboardList, FaSignOutAlt } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("user");
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <div className="bg-blue-800 text-white w-64 h-screen fixed top-0 left-0 p-5 space-y-6">
        <h2 className="text-xl font-bold">Clock In/Out</h2>
        <nav className="space-y-4">
          <NavLink to="/dashboard/home" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded">
            <FaHome /> Home
          </NavLink>
          <NavLink to="/dashboard/attendance" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded">
            <FaClipboardList /> Attendance
          </NavLink>
          <NavLink to="/dashboard/holidays" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded">
            <FaCalendarAlt /> Holidays
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Fixed Navbar */}
        <nav className="fixed top-0 left-64 right-0 z-50 bg-yellow-500 shadow-md h-12 flex items-center px-4 md:px-8 justify-between">
          <span className="text-white text-lg font-semibold">
            Welcome, {user?.displayName || "User"}!
          </span>
          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || DefaultProfile}
              alt="Profile"
              className="w-9 h-9 rounded-full cursor-pointer border border-gray-300"
              onClick={() => setShow(true)}
            />
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Adjusted Content Padding to Avoid Overlap */}
        <div className="pt-16 p-4">
          <Outlet />
        </div>

        {/* Profile Modal */}
        {show && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShow(false)}
          >
            <div
              className="bg-white p-5 rounded-lg shadow-lg text-center"
              onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
            >
              <img
                src={user?.photoURL || DefaultProfile}
                alt="Profile"
                className="w-36 h-36 rounded-full mx-auto border border-gray-300"
              />
              <h5 className="mt-3 text-lg font-semibold">{user?.displayName || user?.email}</h5>
              <button
                onClick={() => setShow(false)}
                className="mt-4 bg-gray-500 text-white px-4 py-1 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
