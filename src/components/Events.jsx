/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebase/firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import emailjs from '@emailjs/browser';
import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import dayjs from "dayjs";
import { BsCalendar2Event } from "react-icons/bs";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Pagination,
  TextField,
  Autocomplete,
  IconButton,
  Grid,
  Button,
  Tooltip,
  Modal,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "./ConfirmationDialog";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

function EventPage({ holidays, selectedDate, startPage }) {
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [guests, setGuests] = useState([]);
  const [guestInput, setGuestInput] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [pageEvents, setPageEvents] = useState([]);
  const [numberOfEvents, setNumberOfEvents] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [docId, setDocID] = useState(null);
  const [numberOfEventsPerPage, setNumberOfEventsPerPage] = useState(5);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [closeConfirmationOpen, setCloseConfirmationOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handlePageChange = (value) => {
    setPage(value);
    const startIndex = (value - 1) * numberOfEventsPerPage;
    const endIndex = value * numberOfEventsPerPage;
    const newEvents = events.slice(startIndex, endIndex);
    setPageEvents(newEvents);
  };

  const convertTime = (timeToConvert) => {
    const amPm = timeToConvert.split(" ")[1];
    const time = timeToConvert.split(" ")[0];

    let a = time.split(":")[0];
    let min = time.split(":")[1];
    let hour = parseInt(a, 10);
    if (amPm === "PM" && hour < 12) {
      hour += 12;
    }
    let dateTime = selectedDate + "T" + hour + ":" + min;
    return dayjs(dateTime);
  };

  const openEvent = (event) => {
    setDocID(event.id);
    setEventName(event.eventName);
    setLocation(event.location);
    setStartTime(convertTime(event.startTime));
    setEndTime(convertTime(event.endTime));
    setAttachments(event.attachments);
    setGuests(event.guests);
    setDescription(event.description);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleStartTimeChange = (newStartTime) => {
    setUnsavedChanges(true);
    setStartTime(dayjs(newStartTime).format("hh:mm A"));
  };

  const handleEndTimeChange = (newEndTime) => {
    setUnsavedChanges(true);
    setEndTime(dayjs(newEndTime).format("hh:mm A"));
  };

  const handleFileUpload = (e) => {
    setUnsavedChanges(true);
    const files = e.target.files;
    setAttachments([...attachments, ...files]);
  };

  const handleDeleteAttachment = (index) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && guestInput.trim() !== "") {
      setGuests([...guests, guestInput.trim()]);
      setGuestInput("");
    }
  };

  const handleChange = (e) => {
    setUnsavedChanges(true);
    setGuestInput(e.target.value);
  };

  const removeGuest = (email) => {
    setGuests(guests.filter((guest) => guest !== email));
  };

  useEffect(() => {
    const fetchUserId = () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          console.log("User is not logged in");
        }
      });
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setPage((prevPage) => {
          return 1;
        });
        const eventsRef = collection(db, "events");
        const eventsSnapshot = await getDocs(
          query(
            eventsRef,
            where("userId", "==", userId),
            where("startDate", "==", selectedDate)
          )
        );

        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(eventsData);
        
        const pageCount = Math.ceil(eventsData.length / numberOfEventsPerPage);
        setPageCount(pageCount);
        
        setNumberOfEvents(eventsData.length);
        const newEvents = eventsData.slice(0, numberOfEventsPerPage);
        setPageEvents(newEvents);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    if (userId) {
      fetchEvents();
    }
    setPageEvents([]);
    setNumberOfEvents(0);
    setPageCount(0);
    setNumberOfEventsPerPage(5);
  }, [selectedDate, userId]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = (submit) => {
    if ( submit !== 'submit' &&
      unsavedChanges &&
      (eventName || location || startTime || endTime || guests.length)
    ) {
      setCloseConfirmationOpen(true);
    }else{
      setIsModalOpen(false);
      confirmationClose();
    }
  };

  const confirmationClose = () => {
    setCloseConfirmationOpen(false);
    setIsModalOpen(false);
    setEventName("");
    setLocation("");
    setStartTime("");
    setEndTime("");
    setGuests([]);
    setDescription("");
    setAttachments([]);
    setIsEdit(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnsavedChanges(false);

    if (!eventName || !location || !startTime || !endTime || !guests.length) {
      setErrorMessage(
        "All fields except attachments and description are required."
      );
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage("Start time should be earlier than end time.");
      return;
    }

    const eventsRef = collection(db, "events");
    const eventsSnapshot = await getDocs(
      query(
        eventsRef,
        where("userId", "==", userId),
        where("startDate", "==", selectedDate)
      )
    );

    const eventsData = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const conflictingEvents = eventsData.filter((event) => {
      return (
        (startTime > event.startTime && startTime < event.endTime) ||
        (endTime > event.startTime && endTime < event.endTime)
      );
    });

    if (conflictingEvents.length > 0) {
      setErrorMessage("Time conflicts with existing events.");
      return;
    }

    try {
      const attachmentData = await Promise.all(
        attachments.map(async (attachment) => {
          const storageRef = ref(
            storage,
            `attachments/${userId}/${attachment.name}`
          );
          await uploadBytes(storageRef, attachment);
          const url = await getDownloadURL(storageRef);
          return { name: attachment.name, url };
        })
      );
        const attachData = attachmentData;
      const eventData = {
        eventName,
        location,
        startTime,
        startDate: selectedDate,
        endTime,
        guests,
        description,
        attachments: attachData,
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        userId: userId,
      };

      if (isEdit) {
        const docRef = doc(collection(db, "events"), docId);

        eventData["startTime"] = dayjs(eventData["startTime"], "HH:mm").format(
          "hh:mm A"
        );
        eventData["endTime"] = dayjs(eventData["endTime"], "HH:mm").format(
          "hh:mm A"
        );
        await updateDoc(docRef, eventData);
        setEvents((prevEents) => {
          let updatedEvent = prevEents.filter((eve) => eve.id !== docRef.id);
          updatedEvent = [...updatedEvent, { ...eventData, id: docRef.id }];
          return updatedEvent;
        });
      } else {
        const docRef = await addDoc(collection(db, "events"), eventData);
        const eventDataWithId = { ...eventData, id: docRef.id };
        setEvents((prev) => [...prev, eventDataWithId]);
        const newPageCount = Math.ceil(
          (events.length + 1) / numberOfEventsPerPage
        );
        setPageCount(newPageCount);
        if (newPageCount === page) {
          setPageEvents((prevPageEvents) => [
            ...prevPageEvents,
            eventDataWithId,
          ]);
        }
      }
      closeModal("submit");
      const emailContent = {
        to_name:`${guests.length>1 ? "All" : ""}`,
        event_name:eventName,
        event_location: location,
        event_date: selectedDate,
        event_startTime: startTime,
        event_endTime: endTime,
        event_guests: guests.join('\n'),
        event_attachements: attachData.map((attchment)=>{return attchment.url}).join(', '),
        event_description: description || "",
        from_name: "Vaddineni",
        message: `An Event has been ${isEdit ? "edited" : "added"} by Bharath`,
        to_email: guests.join(','),
        reply_to: "vaddinenibk@gmail.com",
      };

      emailjs.send('service_tvogigt', 'template_jedd3ev', emailContent,{
        publicKey: import.meta.env.VITE_APP_PUBLICKEY,
      }).then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
        },
        (error) => {
          console.log('FAILED...', error);
        },
      );

      
    } catch (error) {
      console.error("Error adding event to Firebase:", error);
    }
  };

  const handleDeleteEvent = async (event) => {
    setDeleteEventId(event.id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteEvent = async () => {
    setDeleteConfirmationOpen(false);
    setEvents((prevEvents) =>
      prevEvents.filter((eve) => eve.id !== deleteEventId)
    );
    await deleteDoc(doc(db, "events", deleteEventId));
    const updatedEventsData = events.filter(
      (event) => event.id !== deleteEventId
    );
    const updatedPageCount = Math.ceil(
      updatedEventsData.length / numberOfEventsPerPage
    );
    setPageCount(updatedPageCount);
    if (updatedPageCount < pageCount && page > updatedPageCount) {
      setPage(updatedPageCount);
      const startIndex = (updatedPageCount - 1) * numberOfEventsPerPage;
      const endIndex = updatedPageCount * numberOfEventsPerPage;
      const newPageEvents = updatedEventsData.slice(startIndex, endIndex);
      setPageEvents(newPageEvents);
    } else {
      setPageEvents(updatedEventsData.slice((page-1)*numberOfEventsPerPage, numberOfEventsPerPage));
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-8 items-center">
        <h2 className="text-lg font-semibold mb-2 text-center text-cyan-600">
          Events for{" "}
          {selectedDate === format(new Date(), "yyyy-MM-dd")
            ? "Today"
            : selectedDate}
        </h2>
        <BsCalendar2Event
          className="text-xl cursor-pointer"
          onClick={openModal}
        />
      </div>
      {holidays.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2 className="text-md font-semibold mb-4 underline">HOLIDAY</h2>
          {holidays.map((holiday, index) =>
            holiday.date === selectedDate ? (
              <div
                key={index}
                className="border border-slate-100 bg-purple-700 text-white rounded-lg shadow-lg p-2 mb-2 px-4 cursor-pointer hover:shadow-amber-100"
              >
                {holiday.name}
              </div>
            ) : (
              <div key={index}></div>
            )
          )}
        </div>
      )}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-center">No events scheduled! Let's have some fun!</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px", minHeight: "300px" }}>
            <h2 className="text-md font-semibold mb-4 underline">
              UPCOMING EVENTS
            </h2>
            {pageEvents.map((event) => (
              <div key={event.id} className="flex justify-between">
                <div
                  className="border border-slate-100 rounded-lg shadow-lg p-2 mb-2 px-4 cursor-pointer hover:shadow-amber-100 "
                  role="button"
                  onClick={() => openEvent(event)}
                >
                  <p>
                    <strong>{event.eventName}</strong>
                    <span className="italic text-sm mx-4 text-red-500">
                      {event.startTime} to {event.endTime}
                    </span>
                  </p>
                </div>
                <div>
                  <DeleteIcon
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleDeleteEvent(event)}
                  />
                </div>
              </div>
            ))}

            {/* <Pagination
            count={pageCount}
            onChange={handlePageChange}
          ></Pagination> */}
          </div>
          <div className="flex justify-center items-center">
            {pageCount > 0 &&
              Array.from({ length: pageCount }, (_, index) => (
                <Button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  sx={{
                    m: 2,
                    backgroundColor: `${
                      page === index + 1 ? "rgb(51 65 85 )" : "white"
                    }`,
                    color: `${page === index + 1 ? "white" : "black"}`,
                    border: "1px solid rgb(226 232 240) ",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    minWidth: 0,
                    "&:hover": {
                      backgroundColor: "white",
                      color: "black",
                    },
                  }}
                >
                  {index + 1}
                </Button>
              ))}
          </div>
        </>
      )}
      <div>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="event-modal"
          aria-describedby="select-event-calendar"
        >
          <Card
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "400px", 
              maxWidth: "800px", 
              padding: "20px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <CardHeader
              title="Add event"
              action={
                <IconButton aria-label="close" onClick={()=>closeModal('close')}>
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent>
              <TextField
                id="event"
                label="Event"
                variant="outlined"
                fullWidth
                margin="normal"
                value={eventName}
                onChange={(e) => {
                  setUnsavedChanges(true);
                  setEventName(e.target.value);
                }}
                required
              />
              <TextField
                id="location"
                label="Location"
                variant="outlined"
                fullWidth
                margin="normal"
                value={location}
                onChange={(e) => {
                  setUnsavedChanges(true);
                  setLocation(e.target.value);
                }}
                required
              />
              <TextField
                id="startDate"
                label="Start Date"
                variant="outlined"
                fullWidth
                margin="normal"
                value={selectedDate}
                disabled
              />
              <Box sx={{ my: "10px" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ mt: "10px" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={handleEndTimeChange}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Box>
              <TextField
                id="guests"
                label="Guests"
                variant="outlined"
                fullWidth
                margin="normal"
                value={guestInput}
                placeholder="Press enter to add the guests......"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
              />
              <List>
                {guests.map((guest, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={guest} />
                    <IconButton onClick={() => removeGuest(guest)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <TextField
                id="description"
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                margin="normal"
                value={description}
                onChange={(e) => {
                  setUnsavedChanges(true);
                  setDescription(e.target.value);
                }}
              />
              <input
                type="file"
                id="attachment"
                multiple
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <label htmlFor="attachment">
                <Button variant="outlined" component="span">
                  Upload Attachment
                </Button>
              </label>
              <Typography variant="subtitle2">Selected Attachments:</Typography>
              <List>
                {attachments.map((attachment, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={attachment.name} />
                    <IconButton onClick={() => handleDeleteAttachment(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              {isEdit ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleSubmit}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              )}
            </CardContent>
          </Card>
        </Modal>
      </div>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </MuiAlert>
      </Snackbar>
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        handleClose={() => setDeleteConfirmationOpen(false)}
        handleConfirm={confirmDeleteEvent}
        title="Deleting the event."
        message="Are you sure you want to delete this Event?"
      />
      <ConfirmationDialog
        open={closeConfirmationOpen}
        handleClose={() => setCloseConfirmationOpen(false)}
        handleConfirm={confirmationClose}
        title="Closing the form."
        message="Are you sure you want to close the form?"
      />
    </div>
  );
}

export default EventPage;
