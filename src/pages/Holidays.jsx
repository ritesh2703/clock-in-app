import React, { useState, useEffect } from "react";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const API_KEY = "cXDbYg3T2XzdVEEG5vY8oX0s4NitT39F"; // Replace with your API key
        const COUNTRY = "IN"; // Country code (e.g., "IN" for India)
        
        const response = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${COUNTRY}&year=${selectedYear}`
        );

        const data = await response.json();

        if (data.meta.code !== 200) {
          throw new Error("Failed to fetch holidays");
        }

        // Filter holidays for selected month
        const monthlyHolidays = data.response.holidays.filter(
          (holiday) => new Date(holiday.date.iso).getMonth() + 1 === selectedMonth
        );

        setHolidays(monthlyHolidays);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="h-screen overflow-y-auto p-6 bg-gray-100">
      <h2 className="text-2xl font-bold">Public Holidays</h2>
      <p className="text-gray-600 mt-2">Select a month and year to view holidays.</p>

      {/* Month & Year Selection */}
      <div className="flex space-x-4 mt-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="p-2 border rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2025, i, 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 border rounded"
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Holidays List */}
      {loading && <p className="text-gray-500 mt-4">Loading holidays...</p>}
      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      <div className="mt-4 space-y-4">
        {holidays.length > 0 ? (
          holidays.map((holiday) => (
            <div key={holiday.date.iso} className="bg-white p-4 shadow rounded-lg">
              <h4 className="font-medium">{holiday.name}</h4>
              <span className="text-gray-600">{new Date(holiday.date.iso).toDateString()}</span>
            </div>
          ))
        ) : (
          !loading && <p className="text-gray-500 mt-4">No holidays this month.</p>
        )}
      </div>
    </div>
  );
};

export default Holidays;
