import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import Left from "./Left";
import Right from "./Right";
import "../../Styles/Dashboard.css"; // Import our CSS file


const Dashboard = () => {
 
  return (
    <div className="dashboard-container">
        <div className="left">
        <Left/>
        </div>

        <div className="right">
        <Right/>
        </div>
    </div>
  );
};

export default Dashboard;