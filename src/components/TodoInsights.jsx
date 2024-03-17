/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { getDocs, collection, where, query } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import CategoryDistributionChart from "./CategoryDistributionChart ";
import PriorityDistributionChart from "./PriorityDistributionChart";
import CompletionRateChart from "./CompletionRateChart";

const Insights = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const userId = auth.currentUser.uid;
        const todosRef = collection(db, "todos");
        const userTodosQuery = query(todosRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(userTodosQuery);

        const todosData = [];
        querySnapshot.forEach((doc) => {
          todosData.push({ id: doc.id, ...doc.data() });
        });

        setTodos(todosData);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, []);

  return (
    <Box sx={{ margin: "10px" }}>
      <Typography variant="h4" gutterBottom>
        Insights
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <CategoryDistributionChart todos={todos} />
        </Grid>
        <Grid item xs={12} md={4}>
          <PriorityDistributionChart todos={todos} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CompletionRateChart todos={todos} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Insights;
