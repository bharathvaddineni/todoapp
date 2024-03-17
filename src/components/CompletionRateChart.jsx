/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Chart } from "chart.js/auto";

const CompletionRateChart = ({ todos }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (todos.length > 0) {
      const completedCount = todos.filter((todo) => todo.completed).length;
      const incompleteCount = todos.length - completedCount;
      if (chartRef.current !== null) {
        chartRef.current.destroy();
      }

      const ctx = document.getElementById("completionRateChart");
      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Completed", "Yet to complete"],
          datasets: [
            {
                label: "Completed",
                data: [completedCount, 0],
                backgroundColor: "rgb(54, 162, 235)",
                borderColor: "rgb(54, 162, 235)",
                borderWidth: 1,
                barThickness: 50,
            },
            {
                label: "Yet to complete",
                data: [0, incompleteCount],
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 1,
                barThickness: 50,
              },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [todos]);

  return (
    <Box sx={{ margin: '25px', padding: '15px',border:'1px solid rgba(0,0,0,0.1)', borderRadius: '10px', boxShadow: '10px 10px 10px -5px grey' }}>
      <Typography variant="h6" gutterBottom>
        Completion Rate
      </Typography>
      <canvas id="completionRateChart" width="400" height="400"></canvas>
    </Box>
  );
};

export default CompletionRateChart;
