/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import EventPage from "./Events";
import axios from "axios";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  getDay,
  subDays,
} from "date-fns";

function MonthView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setevents] = useState({});
  const [holidays, setHolidays] = useState([{}]);

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const prevMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };
  const getDaysInMonth = (month, year) => {
    const monthStart = startOfMonth(new Date(year, month));

    const monthEnd = endOfMonth(monthStart);

    const startDate = startOfWeek(monthStart);

    const endDate = endOfWeek(monthEnd);

    const allDays = [];
    for (let i = 0; i < monthStart.getDay(); i++) {
      allDays.push("");
    }
    let currentDate = startDate;
    while (currentDate <= endDate) {
      if (currentDate.getMonth() === month) {
        allDays.push(currentDate);
      }
      currentDate = addDays(currentDate, 1);
    }

    return allDays;
  };

  const handleMonthChange = (event) => {
    const month = parseInt(event.target.value);
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), month, 1));
  };

  const handleSelectedDate = (day) => {
    setSelectedDate(format(day, "yyyy-MM-dd"));
  };

  const daysInMonth = getDaysInMonth(
    currentDate.getMonth(),
    currentDate.getFullYear()
  );

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  useEffect(() => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  }, []);

  useEffect(() => {
    const getHolidays = async () => {
      try {
        const res = await axios.get(
          "https://date.nager.at/api/v3/publicholidays/2024/US"
        );
        const holidays = res.data.map((holiday) => {
          return { date: holiday.date, name: holiday.name };
        });
        setHolidays(holidays);
      } catch (error) {
        console.log("Error getting holidays");
      }
    };
    getHolidays();
  });

  return (
    <div className="width-100 mx-auto mt-8 flex flex-wrap">
      <div className="flex-1 m-8 border border-gray-00 shadow-lg rounded-3xl p-4">
        <div className="flex items-center justify-between mb-4  flex-wrap">
          <div className="flex items-center">
            <select
              className="mr-2 px-2 py-1 text-teal-600"
              value={currentDate.getMonth()}
              onChange={handleMonthChange}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              className="mr-2 px-2 py-1 max-h-48 overflow-y-scroll text-teal-600"
              value={currentDate.getFullYear()}
              onChange={(e) =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    parseInt(e.target.value),
                    1
                  )
                )
              }
            >
              {Array.from(
                { length: 10 },
                (_, i) => currentDate.getFullYear() - 5 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              className="md:p-4 p-2 hover:text-red-800 text-red-600 text-lg"
              onClick={prevMonth}
            >
              &lt;
            </button>
            <button
              className="md:p-4 p-2 text-teal-600 text-lg"
              onClick={goToToday}
            >
              Today
            </button>
            <button
              className="md:p-4 p-2 text-red-600 hover:text-red-800 text-lg"
              onClick={nextMonth}
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 ">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center w-10 h-10 flex items-center justify-center text-blue-600 mb-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2">
          {daysInMonth.map((day, index) => {
            return day ? (
              <div
                key={index}
                className={`text-center border border-slate-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-700 hover:text-white ${
                  isToday(day) ? "bg-red-300" : ""
                } ${
                  selectedDate === format(day, "yyyy-MM-dd")
                    ? "bg-slate-700 text-white"
                    : ""
                } ${
                  holidays.some(
                    (holiday) => holiday.date === format(day, "yyyy-MM-dd")
                  )
                    ? " bg-purple-500 text-white"
                    : ""
                }`}
                onClick={() => handleSelectedDate(day)}
              >
                {format(day, "d")}
              </div>
            ) : (
              <div key={index} className="w-10 h-10"></div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center"></div>
      </div>
      <div className="flex-1 m-8">
        <EventPage
          holidays={holidays}
          selectedDate={selectedDate}
          startPage={1}
        />
        {/* {selectedDate && <p>{selectedDate}</p>} */}
      </div>
    </div>
  );
}

export default MonthView;
