/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from 'axios'
import {
  Card,
  CardHeader,
  CardContent,
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
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "./ConfirmationDialog";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import useMediaQuery from "@mui/material/useMediaQuery";
import { db, auth, storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { DatePicker } from "@mui/x-date-pickers";
import {
  collection,
  getDocs,
  where,
  query,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import TodoList from "./TodoList";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import dayjs from "dayjs";

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [unsortedTodos, setUnsortedTodos] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [task, setTask] = useState("");
  const [subTasks, setSubTasks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [priority, setPriority] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteItemIndex, setDeleteItemIndex] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [dueDateTime, setDueDateTime] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTaskId, setEditedTaskId] = useState(null);
  const [sortBy, setSortBy] = useState("Sort");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tasksSuggestion, setTasksSuggestion] = useState([]);

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
 

  const handleResetDate = () => {
    setSelectedDate(null);
    setCalendarOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    const sortOption = event.target.value;
    setSortBy(sortOption);
    if (sortOption === "dueDate") {
      const sortedTodos = [...todos].sort(
        (a, b) => new Date(b.dueDateTime) - new Date(a.dueDateTime)
      );
      setTodos(sortedTodos);
    } else if (sortOption === "priority") {
      const sortedTodos = [...todos].sort((a, b) => {
        const priorityOrder = { Low: 1, Medium: 2, High: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setTodos(sortedTodos);
    } else {
      setSortBy("Sort");
      setTodos(unsortedTodos);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      const todoQuery = query(
        collection(db, "todos"),
        where("id", "==", todoId)
      );
      const querySnapshot = await getDocs(todoQuery);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      const updatedTodos = todos.filter((todo) => todo.id !== todoId);
      setTodos(updatedTodos);
      setUnsortedTodos(updatedTodos);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleEdit = (todo) => {
    setIsEditing(true);
    setTask(todo.task);
    setEditedTaskId(todo.id);
    setSubTasks(todo.subTasks.map((subTask) => subTask.task));
    setAttachments(todo.attachments);
    setSelectedCategories(todo.categories);
    setDueDateTime(format(new Date(todo.dueDateTime), "MM/dd/yyyy hh:mm aa"));
    setPriority(todo.priority);
    setEditTask(todo);
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!task.trim()) {
        alert("Task field cannot be empty");
        return;
      }
      if (isEditing) {
        await updateTaskInFirestore();
      } else {
        await addNewTaskToFirestore();
      }

      resetFormFields();
      setOpenModal(false);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const updateTaskInFirestore = async () => {
    try {
      const user = auth.currentUser;
      const editedTaskIndex = todos.findIndex(
        (todo) => todo.id === editedTaskId
      );

      if (editedTaskIndex === -1) {
        console.error("Edited task not found");
        return;
      }
      const attachmentData = await Promise.all(
        attachments.map(async (attachment) => {
          const storageRef = ref(
            storage,
            `attachments/${user.uid}/${attachment.name}`
          );
          await uploadBytes(storageRef, attachment);
          const url = await getDownloadURL(storageRef);
          return { name: attachment.name, url };
        })
      );
      const newSubTaskIds = subTasks
        .slice(todos[editedTaskIndex].subTasks.length)
        .map(() => uuidv4());
      const formattedDueDateTime = dueDateTime
        ? dayjs(dueDateTime).toISOString()
        : null;
        const currentDateAndTime = new Date().toISOString();
      const editedTask = {
        userId: user.uid,
        id: editedTaskId,
        task: task.trim(),
        subTasks: subTasks.map((subTask, index) => ({
          id:
            index < todos[editedTaskIndex].subTasks.length
              ? todos[editedTaskIndex].subTasks[index].id
              : newSubTaskIds[index - todos[editedTaskIndex].subTasks.length],
          task: subTask.trim(),
          completed: editTask.subTasks[index]
            ? editTask.subTasks[index].completed
            : false,
        })),
        attachments: attachmentData,
        dueDateTime: formattedDueDateTime,
        priority,
        categories: selectedCategories,
        modifiedDateAndTime: currentDateAndTime,
      };
      const todoQuerySnapshot = await getDocs(
        query(collection(db, "todos"), where("id", "==", editedTaskId))
      );
      const todoDoc = todoQuerySnapshot.docs[0];
      if (todoDoc.exists()) {
        const todoRef = doc(db, "todos", todoDoc.id);
        await updateDoc(todoRef, editedTask);
      } else {
        console.error("Todo document not found with id:", editedTaskId);
        return;
      }

      const updatedTodos = [...todos];
      updatedTodos[editedTaskIndex] = editedTask;
      setTodos(updatedTodos);
      setUnsortedTodos(updatedTodos);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const addNewTaskToFirestore = async () => {
    try {
      const taskId = uuidv4();
      const subTaskIds = subTasks.map(() => uuidv4());
      const user = auth.currentUser;
      const attachmentData = await Promise.all(
        attachments.map(async (attachment) => {
          const storageRef = ref(
            storage,
            `attachments/${user.uid}/${attachment.name}`
          );
          await uploadBytes(storageRef, attachment);
          const url = await getDownloadURL(storageRef);
          return { name: attachment.name, url };
        })
      );
      const currentDateAndTime = new Date().toISOString();
      const docRef = await addDoc(collection(db, "todos"), {
        userId: user.uid,
        task: task.trim(),
        id: taskId,
        subTasks: subTasks.map((subTask, index) => ({
          id: subTaskIds[index],
          task: subTask.trim(),
          completed: false,
        })),
        attachments: attachmentData,
        dueDateTime: dueDateTime ? dueDateTime.toISOString() : null,
        priority,
        categories: selectedCategories,
        completed: false,
        createdDateAndTime: currentDateAndTime,
        modifiedDateAndTime: currentDateAndTime,
      });
      const updatedAttachments = [...attachmentData];
      setAttachments(updatedAttachments);

      const updatedSubTasks = [...subTasks.map((subTask) => subTask.trim())];
      setSubTasks(updatedSubTasks);

      const updatedTodos = [
        ...todos,
        {
          id: taskId,
          task,
          subTasks: subTasks.map((subTask, index) => ({
            id: subTaskIds[index],
            task: subTask.trim(),
          })),
          attachments: updatedAttachments,
          dueDateTime,
          priority,
          categories: selectedCategories,
        },
      ];

      setTodos(updatedTodos);
      setUnsortedTodos(updatedTodos);
      setTask("");
      setSubTasks([]);
      setAttachments([]);
      setSelectedCategories([]);
      setPriority("");
      setDueDateTime(null);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const resetFormFields = () => {
    setTask("");
    setSubTasks([]);
    setAttachments([]);
    setSelectedCategories([]);
    setDueDateTime(null);
    setUnsavedChanges(false);
    setIsEditing(false);
    setEditedTaskId(null);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    const hasFormData =
      task.trim() !== "" ||
      subTasks.some((subTask) => subTask.trim() !== "") ||
      attachments.length > 0 ||
      selectedCategories.length > 0 ||
      dueDateTime !== null;

    if (unsavedChanges && hasFormData) {
      setOpenConfirmationDialog(true);
    } else {
      setOpenModal(false);
      setTask("");
      setSubTasks([]);
      setAttachments([]);
      setSelectedCategories([]);
      setDueDateTime(null);
      setUnsavedChanges(false);
    }
  };

  const closeForm = () => {
    setOpenModal(false);
    setTask("");
    setSubTasks([]);
    setAttachments([]);
    setSelectedCategories([]);
    setUnsavedChanges(false);
    setDueDateTime(null);
  };

  const handleConfirmClose = () => {
    closeForm();
    setOpenConfirmationDialog(false);
  };

  const handleAddSubTask = () => {
    setSubTasks([...subTasks, ""]);
  };

  const handleDeleteSubTask = (index) => {
    if (subTasks[index]) {
      setDeleteItemIndex(index);
      setDeleteConfirmationOpen(true);
    } else {
      const updatedSubTasks = [...subTasks];
      updatedSubTasks.splice(index, 1);
      setSubTasks(updatedSubTasks);
    }
  };

  const confirmDeleteSubTask = () => {
    const updatedSubTasks = [...subTasks];
    updatedSubTasks.splice(deleteItemIndex, 1);
    setSubTasks(updatedSubTasks);
    setDeleteConfirmationOpen(false);
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    setAttachments([...attachments, ...files]);
  };

  const handleDeleteAttachment = (index) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategories(event.target.value);
  };

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };
  const fetchTodos = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const todoQuery = query(
          collection(db, "todos"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(todoQuery);
        const historyData = [];
        querySnapshot.forEach((doc) => {
          historyData.push({ id: doc.id, ...doc.data() });
        });
        const todosData = historyData.filter((todo) => !todo.completed);
        const tasks = [];
        const subtasks = [];

        historyData.forEach((todo) => {
          tasks.push(todo.task);
          todo.subTasks.forEach((subTask) => {
            subtasks.push(subTask.task);
          });
        });

        setTasksSuggestion(tasks);

        let filteredTodos = todosData;
        filteredTodos = selectedDate
          ? todos.filter((todo) => {
              const todoDate = format(new Date(todo.dueDateTime), "MM/dd/yyyy");
              const selectedDateString = format(
                new Date(selectedDate),
                "MM/dd/yyyy"
              );
              return todoDate === selectedDateString;
            })
          : todosData;
        if (searchQuery.trim() !== "") {
          filteredTodos = todosData.filter((todo) =>
            todo.categories.some((category) =>
              category.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        }

        setTodos(filteredTodos);
        setUnsortedTodos(filteredTodos);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };
  useEffect(() => {
       fetchTodos();
  }, [searchQuery, selectedDate]);

  const isXsScreen = useMediaQuery("(max-width:900px)");

  return (
    <>
      <Card style={{ margin: "20px", padding: "10px" }}>
        <CardHeader
          style={{ background: "#E0F7FA", flexShrink: 1 }}
          action={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ marginRight: "10px" }}>
                <TextField
                  id="search"
                  label="Search"
                  variant="outlined"
                  size="small"
                  placeholder="Search for #hashtags"
                  onChange={handleSearchChange}
                />
              </div>
              <div style={{ marginRight: "10px" }}>
                <Select
                  // label="Sort"
                  value={sortBy}
                  onChange={handleSortChange}
                  variant="outlined"
                  size="small"
                  style={{ minWidth: "120px" }}
                >
                  <MenuItem value="Sort">Sort</MenuItem>
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="reset">Reset</MenuItem>
                </Select>
              </div>
              <div style={{ marginRight: "10px" }}>
                <IconButton
                  aria-label="filter"
                  onClick={() => setCalendarOpen(!calendarOpen)}
                >
                  <Tooltip title="Filter">
                    <FilterListIcon />
                  </Tooltip>
                </IconButton>
              </div>
              <div>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  color="primary"
                  onClick={handleOpenModal}
                >
                  {isXsScreen ? "Add" : "Add Todo"}
                </Button>
              </div>
            </div>
          }
        />

        <CardContent>
          {todos.length === 0 && searchQuery.trim() !== "" ? (
            <Typography variant="body1" align="center" color="textSecondary">
              No todos found matching the #hashtag.
            </Typography>
          ) : todos.length === 0 ? (
            <Typography variant="body1" align="center" color="textSecondary">
              Whoopsie-daisy! 🙈 Looks like my to-do list is as barren as a
              desert at high noon 🌵. Time to sprinkle some sparkle and add
              tasks that'll make my day more exciting than a squirrel on a
              trampoline! 🐿️✨
            </Typography>
          ) : (
            <TodoList
              todos={todos}
              setTodos={setTodos}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="add-todo-modal"
        aria-describedby="add-todo-form"
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
            title="Add Todo"
            action={
              <IconButton aria-label="close" onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            }
          />
          <CardContent>
            <TextField
              id="task"
              label="Task"
              variant="outlined"
              fullWidth
              margin="normal"
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                setUnsavedChanges(true);
              }}
            />

            {subTasks.length > 0 &&
              subTasks.map((subTask, index) => (
                <Grid container spacing={2} key={index} alignItems="center">
                  <Grid item xs>
                    <TextField
                      label={`Sub Task ${index + 1}`}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={subTask}
                      onChange={(e) => {
                        const updatedSubTasks = [...subTasks];
                        updatedSubTasks[index] = e.target.value;
                        setSubTasks(updatedSubTasks);
                        setUnsavedChanges(true);
                      }}
                      disabled={
                        editTask &&
                        editTask.subTasks[index] &&
                        editTask.subTasks[index].completed
                      }
                    />
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteSubTask(index)}
                      disabled={
                        editTask &&
                        editTask.subTasks[index] &&
                        editTask.subTasks[index].completed
                      }
                    >
                      <Tooltip title="Delete">
                        <DeleteIcon />
                      </Tooltip>
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddSubTask}
            >
              Add Sub Task
            </Button>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Due Date and Time"
                  value={dayjs(dueDateTime)}
                  onChange={(newValue) => {
                    setDueDateTime(newValue);
                    setUnsavedChanges(true);
                  }}
                  textField={(props) => (
                    <TextField {...props} margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </div>
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
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                multiple
                value={selectedCategories}
                onChange={handleCategoryChange}
                renderValue={(selected) => selected.join(", ")}
              >
                <MenuItem value="Work">Work</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="Shopping">Shopping</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={priority}
                onChange={handlePriorityChange}
                defaultValue=""
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </CardContent>
        </Card>
      </Modal>
      <Modal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        aria-labelledby="calendar-modal"
        aria-describedby="select-date-calendar"
      >
        <Card
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: "300px",
            maxWidth: "400px",
            padding: "20px",
          }}
        >
          <CardHeader
            title="Select Date"
            action={
              <IconButton
                aria-label="close"
                onClick={() => setCalendarOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            }
          />
          <CardContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            <Button
              variant="outlined"
              onClick={handleResetDate}
              sx={{ mt: "5px" }}
            >
              Reset Date
            </Button>
          </CardContent>
        </Card>
      </Modal>
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        handleClose={() => setDeleteConfirmationOpen(false)}
        handleConfirm={confirmDeleteSubTask}
        title="Delete Sub Task"
        message="Are you sure you want to delete this sub task?"
      />
      <ConfirmationDialog
        open={openConfirmationDialog}
        handleClose={() => setOpenConfirmationDialog(false)}
        handleConfirm={handleConfirmClose}
        title="Close Without Saving?"
        message="Are you sure you want to close without saving changes?"
      />
    </>
  );
};

export default TodoPage;
