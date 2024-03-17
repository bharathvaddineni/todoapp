/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const sampleEvents = [
    {
      id: 1,
      eventName: "Meeting",
      startDate: "2024-03-16",
      startTime: "05:00",
      endTime: "09:00",
      guests: "John, Jane",
      location: "Conference Room",
      prerequisites: "Project Report",
    },
    {
      id: 2,
      eventName: "Presentation",
      startDate: "2024-03-17",
      startTime: "19:00",
      endTime: "20:15",
      guests: "Team Members",
      location: "Auditorium",
      prerequisites: "Slides",
    },
  ];

const EventForm = ({
  open,
  handleClose,
  handleAddEvent,
  selectedDate,
  selectedHour,
}) => {
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState(null);
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [endTime, setEndTime] = useState("");
  const [guests, setGuests] = useState("");
  const [location, setLocation] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  useEffect(() => {
    if(!startTime) return;
    const options = [];
    let currentHour = parseInt(startTime.split(":")[0]);
    let currentMinute = parseInt(startTime.split(":")[1]);

    while (!(currentHour === 0 && currentMinute === 0)) {
      currentMinute += 15;
      if (currentMinute === 60) {
        currentMinute = 0;
        currentHour += 1;
        if (currentHour > 23) {
          break;
        }
      }
      options.push(
        `${currentHour < 10 ? `0${currentHour}` : currentHour}:${
          currentMinute < 10 ? `0${currentMinute}` : currentMinute
        }`
      );
    }

    setEndTimeOptions(options);
  }, [startTime]);

  useEffect(()=>{
        setStartTime(selectedHour < 10 ? `0${selectedHour}:00` : `${selectedHour}:00`)
  },[selectedHour])

  const handleSubmit = () => {
    const eventData = {
      eventName,
      startDate,
      startTime,
      endTime,
      guests,
      location,
      prerequisites,
    };
    handleAddEvent(eventData);
    setEventName("");
    setGuests("");
    setLocation("");
    setPrerequisites("");
    handleClose();
  };

  useEffect(() => {
    if (open) {
        setEndTimeOptions([]);
    }
  }, [open]);



  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Event</DialogTitle>
      <DialogContent>
        <TextField
          label="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Start Date"
          value={selectedDate}
          disabled
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="start-time-label">Start Time</InputLabel>
          <Select
            labelId="start-time-label"
            label="Start Time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value); 
            }}
            fullWidth
          >
            {Array.from({ length: 4 }, (_, i) => {
              const hour =
                selectedHour < 10 ? `0${selectedHour}` : `${selectedHour}`;
              const minute = i * 15;
              const formattedTime = `${hour}:${minute === 0 ? "00" : minute}`;
              return (
                <MenuItem key={formattedTime} value={formattedTime}>
                  {formattedTime}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="end-time-label">End Time</InputLabel>
          <Select
            labelId="end-time-label"
            label="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
          >
            {endTimeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Prerequisites"
          value={prerequisites}
          onChange={(e) => setPrerequisites(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="secondary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm;
