import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { db, auth } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const History = () => {
  const [completedTodos, setCompletedTodos] = useState([]);
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const fetchCompletedTodos = async () => {
      try {
        const todoRef = collection(db, "todos");
        const completedTodosQuery = query(
          todoRef,
          where("userId", "==", userId),
          where("completed", "==", true)
        );
        const querySnapshot = await getDocs(completedTodosQuery);

        const todos = [];
        querySnapshot.forEach((doc) => {
          const todoData = doc.data();
          todos.push({ id: doc.id, ...todoData });
        });

        const todosWithSubtasks = await Promise.all(
          todos.map(async (todo) => {
            const subtasksRef = collection(db, "subtasks");
            const subtasksQuery = query(
              subtasksRef,
              where("todoId", "==", todo.id)
            );
            const subtasksSnapshot = await getDocs(subtasksQuery);

            const subtasks = [];
            subtasksSnapshot.forEach((subtaskDoc) => {
              subtasks.push({ id: subtaskDoc.id, ...subtaskDoc.data() });
            });

            return { ...todo, subtasks };
          })
        );

        setCompletedTodos(todosWithSubtasks);
      } catch (error) {
        console.error("Error fetching completed todos:", error);
      }
    };

    fetchCompletedTodos();
  }, [userId]);

  const formatDateAndTime = (dateTimeString) => {
    const options = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateTimeString).toLocaleString("en-US", options);
  };

  return (
    <Box sx={{ margin: "10px" }}>
      <Typography variant="h4" gutterBottom>
        Completed Todos History
      </Typography>
      {completedTodos.length === 0 ? (
        <Typography variant="body1">No completed todos found.</Typography>
      ) : (
        <List
          sx={{ display: "flex", justifyContent: "space-between", gap: "20px" }}
        >
          <Box>
            {completedTodos.map((todo) => (
              <ListItem
                key={todo.id}
                sx={{
                  backgroundColor: "orange",
                  padding: "10px",
                  margin: "10px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  minWidth: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", padding: 0 }}
                >
                  <ListItemText
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        display: "flex",
                      }}
                    >
                      Task: {todo.task}
                    </span>{" "}
                      Completed on {formatDateAndTime(todo.modifiedDateAndTime)}
                  </ListItemText>
                  <Typography
                    variant="p"
                    sx={{ fontStyle: "italic", fontWeight: "bold" }}
                  >
                    Sub Tasks:
                  </Typography>
                  <List sx={{ paddingLeft: "20px" }}>
                    {todo.subTasks.map((subtask, index) => (
                      <ListItem key={subtask.id} sx={{ padding: 0 }}>
                        <Typography
                          variant="p"
                          sx={{ marginRight: "2px", fontWeight: "bold" }}
                        >
                          {index + 1}.
                        </Typography>
                        <ListItemText primary={subtask.task} />
                      </ListItem>
                    ))}
                  </List>
                  <List sx={{ display: "flex", gap: "5px" }}>
                    {todo.attachments.map((attachment, index) => (
                      <Chip
                        key={index}
                        label={`#${attachment.name}`}
                        color="secondary"
                        size="small"
                      />
                    ))}
                  </List>
                </Box>
                <Box>
                  <List sx={{ display: "flex", gap: "5px" }}>
                    {todo.categories.map((category, index) => (
                      <Chip
                        key={index}
                        label={`#${category.toLowerCase()}`}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </List>
                </Box>
              </ListItem>
            ))}
          </Box>

        </List>
      )}
    </Box>
  );
};

export default History;
