import React from "react";

const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg w-full md:w-1/3">
      <h4 className="text-gray-600">{title}</h4>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
};

export default StatsCard;
