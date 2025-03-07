import React from "react";
import ClockInOut from "../components/ClockInOut"
import StatsCard from "../components/StatsCard";
import HolidayList from "../components/HolidayList";

const Home = () => {
  return (
    <div className=" lex flex-wrap gap-4 mt-4">
      <div className="mt-6">
        <ClockInOut />
      </div>
    </div>
  );
};

export default Home;
