/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState,useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Chart } from "chart.js/auto";

const PriorityDistributionChart = ({ todos }) => {
    const chartRef = useRef(null);

  useEffect(() => {
    if (todos.length > 0) {
      const priorities = {
        High: 0,
        Medium: 0,
        Low: 0,
      };

      todos.forEach((todo) => {
        priorities[todo.priority]++;
      });
      if (chartRef.current !== null) {
        chartRef.current.destroy();
      }
      const priorityLabels = Object.keys(priorities);
      const priorityCounts = Object.values(priorities);

      const ctx = document.getElementById("priorityDistributionChart");
      const priorityChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: priorityLabels,
          datasets: [
            {
              label: "Priority Distribution",
              data: priorityCounts,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
            },
          },
        },
      });
    }
  }, [todos]);

  return (
    <Box sx={{ margin: '25px', padding: '15px',border:'1px solid rgba(0,0,0,0.1)', borderRadius: '10px', boxShadow: '10px 10px 10px -5px grey' }}>
      <Typography variant="h6" gutterBottom>
        Priority Distribution
      </Typography>
      <canvas id="priorityDistributionChart" width="400" height="400"></canvas>
    </Box>
  );
};

export default PriorityDistributionChart;
