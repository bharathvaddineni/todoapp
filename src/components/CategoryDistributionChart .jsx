/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState,useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Chart } from "chart.js/auto";

const CategoryDistributionChart = ({ todos }) => {
    const chartRef = useRef(null);

  useEffect(() => {
    if (todos.length > 0) {
      const categories = {};
      todos.forEach((todo) => {
        todo.categories.forEach((category) => {
          categories[category] = (categories[category] || 0) + 1;
        });
      });
      if (chartRef.current !== null) {
        chartRef.current.destroy();
      }
      const categoryLabels = Object.keys(categories);
      const categoryCounts = Object.values(categories);

      const ctx = document.getElementById("categoryDistributionChart");
      const categoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: categoryLabels,
          datasets: [
            {
              data: categoryCounts,
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(153, 102, 255)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
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
        Category Distribution
      </Typography>
      <canvas id="categoryDistributionChart" width="400" height="400"></canvas>
    </Box>
  );
};

export default CategoryDistributionChart;
