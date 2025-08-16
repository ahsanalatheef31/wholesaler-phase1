

import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
  } from "recharts";
  import "../../Styles/Dashboard.css"; 
import Card from "./Card";  
export default function Left(){
    const [dashboardStats, setDashboardStats] = useState({
        total_invoices: 0,
        total_pending: 0,
        total_received: 0,
        total_returned: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/dashboard-stats/');
            if (response.ok) {
                const data = await response.json();
                setDashboardStats(data);
            } else {
                console.error('Failed to fetch dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const barData = [
        { name: "A", value: 300 },
        { name: "B", value: 200 },
        { name: "C", value: 150 },
        { name: "D", value: 80 },
        { name: "E", value: 30 },
        { name: "F", value: 270 },
        { name: "G", value: 170 },
        { name: "H", value: 20 },
        { name: "I", value: 70 },
        { name: "J", value: 120 },
      ];
      const [pendingProducts, setPendingProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/pending-products/');
            if (response.ok) {
                const data = await response.json();
                setPendingProducts(data);
            } else {
                console.error('Failed to fetch pending products');
            }
        } catch (error) {
            console.error('Error fetching pending products:', error);
        } finally {
            setProductsLoading(false);
        }
    };
    
    return(
        <div className="left-container">
        <div className="stats-row">
        <Card head="total invoices" value={loading ? "..." : dashboardStats.total_invoices.toLocaleString()} color="green" />
        <Card head="total pending" value={loading ? "..." : dashboardStats.total_pending.toLocaleString()} color="yellow" />
        <Card head="total received" value={loading ? "..." : dashboardStats.total_received.toLocaleString()} color="blue" />
        <Card head="total returned" value={loading ? "..." : dashboardStats.total_returned.toLocaleString()} color="red" />
        </div>

    

      
        <div className="charts-row">
        <h3>Top Suppliers</h3>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
            <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />   {/* cyan */}
                <stop offset="100%" stopColor="#6366f1" stopOpacity={1} /> {/* indigo */}
                </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#dbeafe" />
            <YAxis stroke="#dbeafe" />
            <Tooltip />
            <Bar dataKey="value" fill="url(#barGradient)" radius={[5, 5, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>

      
      <div className="bottom-row">
        <div className="table-card">
          <h3>Pending products</h3>
          <table>
                          <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Price</th>
                </tr>
              </thead>
            <tbody>
              {productsLoading ? (
                <tr>
                  <td colSpan="3" style={{textAlign: 'center'}}>Loading...</td>
                </tr>
              ) : pendingProducts.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{textAlign: 'center'}}>No pending products</td>
                </tr>
              ) : (
                pendingProducts.map((product, i) => (
                  <tr key={i}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        </div>
        </div>
    )
}