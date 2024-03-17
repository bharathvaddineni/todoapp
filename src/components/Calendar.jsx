/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("month");

  const handleViewChange = (view) => {
    setSelectedView(view);
  };
  let viewComponent;
  switch (selectedView) {
    case "month":
      viewComponent = <MonthView currentDate={currentDate} />;
      break;
    case "week":
      viewComponent = <WeekView currentDate={currentDate} />;
      break;
    case "day":
      viewComponent = <DayView currentDate={currentDate} />;
      break;
    default:
      viewComponent = <MonthView currentDate={currentDate} />;
  }

  return (
    <div>
      <div>
        <MonthView currentDate={currentDate} />
      </div>
      {viewComponent}
    </div>
  );
}

export default Calendar;
