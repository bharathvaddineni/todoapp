/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AttachmentSharpIcon from '@mui/icons-material/AttachmentSharp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InsertLinkTwoToneIcon from '@mui/icons-material/InsertLinkTwoTone';
import {
  updateDoc,
  doc,
  getDocs,
  where,
  query,
  collection,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import ConfirmationDialog from "./ConfirmationDialog";
import Confetti from "react-confetti";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TodoList = ({ todos, setTodos, handleEdit, handleDelete }) => {
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const shareViaWhatsApp = (todo) => {
    const attachmentsText = todo.attachments
    ? todo.attachments.map((attachment) => attachment.url).join('\n')
    : 'None';
  const subtasksText = todo.subTasks
    ? todo.subTasks.map((subtask) => subtask.task).join(', ')
    : 'None';
  const categoriesText = todo.categories
    ? todo.categories.join(', ')
    : 'None';

  const message = `Task: ${todo.task}\n` +
    `Subtasks: ${subtasksText}\n` +
    `Due: ${formatDueDate(todo.dueDateTime)}\n` +
    `Priority: ${todo.priority}\n` +
    `Attachments:\n${attachmentsText}\n` +
    `Categories: ${categoriesText}`;

  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
  window.location.href = whatsappUrl;
  };

  const confirmDelete = (todoId) => {
    setDeleteConfirmationOpen(true);
    setDeleteItemId(todoId);
  };

  const handleConfirmDelete = () => {
    handleDelete(deleteItemId);
    setDeleteConfirmationOpen(false);
    setDeleteItemId(null);
  };

  const handleCloseConfirmationDialog = () => {
    setDeleteConfirmationOpen(false);
    setDeleteItemId(null);
  };

  const toggleSubCompletion = async (todoId, subTaskId) => {
    try {
      const todoIndex = todos.findIndex((todo) => todo.id === todoId);
      const subTaskIndex = todos[todoIndex].subTasks.findIndex(
        (subTask) => subTask.id === subTaskId
      );
      const updatedTodos = [...todos];
      updatedTodos[todoIndex].subTasks[subTaskIndex].completed =
        !updatedTodos[todoIndex].subTasks[subTaskIndex].completed;
      updatedTodos[todoIndex].modifiedDateAndTime = new Date().toISOString();
      const allSubTasksCompleted = updatedTodos[todoIndex].subTasks.every(
        (subTask) => subTask.completed
      );
      updatedTodos[todoIndex].completed = allSubTasksCompleted;

      setTodos(updatedTodos);
      const todoQuery = query(
        collection(db, "todos"),
        where("id", "==", todoId)
      );
      const querySnapshot = await getDocs(todoQuery);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          subTasks: updatedTodos[todoIndex].subTasks,
          completed: allSubTasksCompleted,
          modifiedDateAndTime: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error("Error toggling subtask completion:", error);
    }
  };

  const toggleCompletion = async (id) => {
    try {
      const todoIndex = todos.findIndex((todo) => todo.id === id);
      const updatedTodos = [...todos];
      const mainTask = updatedTodos[todoIndex];
      const newCompletionStatus = !mainTask.completed;
      mainTask.completed = newCompletionStatus;
      if (mainTask.subTasks) {
        mainTask.subTasks.forEach((subTask) => {
          subTask.completed = newCompletionStatus;
        });
      }
      mainTask.modifiedDateAndTime = new Date().toISOString();
      setTodos(updatedTodos);
      const todoQuerySnapshot = await getDocs(
        query(collection(db, "todos"), where("id", "==", id))
      );
      const todoDoc = todoQuerySnapshot.docs[0];
      if (todoDoc.exists()) {
        const todoRef = doc(db, "todos", todoDoc.id);
        await updateDoc(todoRef, {
          completed: newCompletionStatus,
          subTasks: mainTask.subTasks,
          modifiedDateAndTime: new Date().toISOString(),
        });
      } else {
        console.error("No document found with id:", id);
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  useEffect(() => {
    const allTodosCompleted = todos.every((todo) => todo.completed);
    console.group("Todos: ", todos);
    if (allTodosCompleted) {
      toast(
        "Hurray! 🎉 All tasks completed! 🙌 Time for a well-deserved break! 😎"
      );
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false); 
        const filteredTodos = todos.filter((todo) => !todo.completed);
        setTodos(filteredTodos);
    },5000)
  }}, [todos]);

  return (
    <>
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      <List style={{ marginTop: "20px" }}>
        {todos.map((todo) => (
          <ListItem
            key={todo.id}
            divider
            style={{
              backgroundColor: getPriorityColor(todo.priority),
              marginBottom: "10px",
              borderRadius: "5px",
              padding: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <div
                style={{
                  marginLeft: "10px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {/* <Checkbox checked={todo.completed} onChange={() => toggleCompletion(todo.id)} /> */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleCompletion(todo.id)}
                />
                <ListItemText
                  primary={
                    <>
                      <span
                        style={{
                          fontFamily: "Arial",
                          fontSize: "16px",
                          color: "#333333",
                          textDecoration: todo.completed
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {todo.task}
                      </span>
                    </>
                  }
                />
              </div>
              <div
                style={{
                  marginLeft: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {todo.subTasks.length > 0 && (
                  <ul
                    style={{
                      listStyleType: "none",
                      paddingLeft: "20px",
                      margin: "5px 0",
                      color: "#333333",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {todo.subTasks.map((subTask, index) => (
                      <li
                        key={index}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        {/* <Checkbox checked={subTask.completed} onChange={() => toggleSubCompletion(todo.id, subTask.id)} /> */}
                        <input
                          type="checkbox"
                          checked={subTask.completed}
                          onChange={() =>
                            toggleSubCompletion(todo.id, subTask.id)
                          }
                        />
                        <span
                          style={{
                            marginLeft: "5px",
                            fontFamily: "Arial",
                            fontSize: "14px",
                            color: "#333333",
                            textDecoration: subTask.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {subTask.task}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {todo.attachments && (
                  <div
                    style={{
                      marginLeft: "20px",
                      marginTop: "5px",
                      color: "#333333",
                      fontFamily: "Arial",
                      fontSize: "0.8rem",
                      display:'flex',
                    }}
                  >
                    {todo.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginRight: "10px",
                          color:'red',
                          textDecoration: "none",
                          display:'flex',
                          alignItems: 'center',
                          gap:'5px'
                        }}
                      >
                        <InsertLinkTwoToneIcon style={{fontSize:'medium',color:"red"}}/>
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                )}
                {todo.categories && (
                  <div
                    style={{
                      marginLeft: "20px",
                      marginTop: "5px",
                      color: "#555555",
                      fontFamily:'Arial'
                    }}
                  >
                    {todo.categories.map((category, index) => (
                      <span
                        key={index}
                        style={{ marginRight: "5px",fontSize:'0.8rem',fontStyle:'italic',fontWeight:'bold'}}
                      >{`#${category.toLowerCase()}`}</span>
                    ))}
                  </div>
                )}
                 {todo.dueDateTime && (
                        <span
                          style={{
                            fontFamily: "Arial",
                            
                            fontSize:'0.8rem',fontWeight:'bold',
                            marginLeft: "20px",
                      marginTop: "5px",
                            color: "#333333",
                          }}
                        >
                          Due: {formatDueDate(todo.dueDateTime)}
                        </span>
                      )}
              </div>
            </div>
            <ListItemSecondaryAction style={{display:'flex',gap:"25px"}}>
            <IconButton edge="end" onClick={() => shareViaWhatsApp(todo)} aria-label="share via whatsapp">
                <WhatsAppIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEdit(todo)}
                disabled={todo.completed}
                style={{ color: todo.completed ? 'grey' : 'black' }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => confirmDelete(todo.id)}
                disabled={todo.completed}
                style={{ color: todo.completed ? 'grey' : 'red' }}
                
              >
                <DeleteIcon/>
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        handleClose={handleCloseConfirmationDialog}
        handleConfirm={handleConfirmDelete}
        title="Delete Todo"
        message="Are you sure you want to delete this todo?"
      />
      <ToastContainer />
    </>
  );
};

const formatDueDate = (dueDateTime) => {
  const date = new Date(dueDateTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Low":
      return "#90EE90"; // Light Green
    case "Medium":
      return "#FFFF99"; // Light Yellow
    case "High":
      return "#FFA500"; // Light Orange
    default:
      return "#90EE90"; // White
  }
};

export default TodoList;
