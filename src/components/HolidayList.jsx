import React from "react";

const holidays = [
  { name: "Holika Dahana", date: "Thu, Mar 13 2025" },
  { name: "Good Friday", date: "Fri, Apr 18 2025" },
];

const HolidayList = () => {
  return (
    <div className="bg-white p-4 shadow-lg rounded-lg w-full md:w-1/2 mx-auto">
      <h3 className="text-xl font-bold">Upcoming Holidays</h3>
      <ul className="mt-4">
        {holidays.map((holiday, index) => (
          <li key={index} className="flex justify-between py-2 border-b">
            <span>{holiday.name}</span>
            <span className="text-gray-600">{holiday.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HolidayList;
