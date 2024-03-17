/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  

  return (
    <div>
      <div>
        <MonthView currentDate={currentDate} />
      </div>
    </div>
  );
}

export default Calendar;
