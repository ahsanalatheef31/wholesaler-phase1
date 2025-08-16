import React, { useState, useEffect } from "react";
import {
    Tooltip, ResponsiveContainer,
       PieChart, Pie, Cell,Legend
     } from "recharts";
     import "../../Styles/Dashboard.css"; 
   export default function Right(){
         const [supplierData, setSupplierData] = useState([]);
         const [loading, setLoading] = useState(true);
         
         const COLORS = ["#00FFFF", "#00BFFF", "#1E90FF", "#0000FF", "#FF6B6B", "#4ECDC4"];
         
         useEffect(() => {
             fetchSupplierData();
         }, []);
         
         const fetchSupplierData = async () => {
             try {
                 const response = await fetch('http://localhost:8000/api/supplier-pie-chart/');
                 if (response.ok) {
                     const data = await response.json();
                     setSupplierData(data);
                 } else {
                     console.error('Failed to fetch supplier data');
                 }
             } catch (error) {
                 console.error('Error fetching supplier data:', error);
             } finally {
                 setLoading(false);
             }
         };
       
         const [categoryData, setCategoryData] = useState([]);
         const [categoryLoading, setCategoryLoading] = useState(true);
         
         useEffect(() => {
             fetchCategoryData();
         }, []);
         
         const fetchCategoryData = async () => {
             try {
                 const response = await fetch('http://localhost:8000/api/category-stats/');
                 if (response.ok) {
                     const data = await response.json();
                     setCategoryData(data);
                 } else {
                     console.error('Failed to fetch category data');
                 }
             } catch (error) {
                 console.error('Error fetching category data:', error);
             } finally {
                 setCategoryLoading(false);
             }
         };
       
       
       return(
           <div className="right-container">
           <div className="chart-card">
               <h3>Top 3 Suppliers by Product Count</h3>
               {loading ? (
                   <div style={{ 
                       height: '250px', 
                       display: 'flex', 
                       alignItems: 'center', 
                       justifyContent: 'center',
                       color: '#dbeafe'
                   }}>
                       Loading supplier data...
                   </div>
               ) : supplierData.length === 0 ? (
                   <div style={{ 
                       height: '250px', 
                       display: 'flex', 
                       alignItems: 'center', 
                       justifyContent: 'center',
                       color: '#dbeafe'
                   }}>
                       No supplier data available
                   </div>
               ) : (
                   <ResponsiveContainer width="100%" height={250}>
                       <PieChart>
                       <Pie
                           data={supplierData}
                           dataKey="value"
                           cx="40%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={80}
                           paddingAngle={3}
                           stroke="none"
                       >
                           {supplierData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                       </Pie>
                       <Tooltip 
                           formatter={(value, name) => [value, 'Products']}
                           labelStyle={{ color: '#1f2937' }}
                           contentStyle={{ 
                               backgroundColor: '#ffffff', 
                               border: '1px solid #e5e7eb',
                               borderRadius: '8px',
                               padding: '8px'
                           }}
                       />
                       <Legend
                           layout="vertical"
                           align="right"
                           verticalAlign="middle"
                           formatter={(value, entry, index) => (
                           <span style={{ color: COLORS[index] }}>{value}</span>
                           )}
                       />
                       </PieChart>
                   </ResponsiveContainer>
               )}
               </div>
           <div className="progress-card">
             <h3>Products by Category</h3>
             {categoryLoading ? (
               <div style={{ 
                   padding: '20px', 
                   textAlign: 'center',
                   color: '#dbeafe'
               }}>
                   Loading category data...
               </div>
             ) : categoryData.length === 0 ? (
               <div style={{ 
                   padding: '20px', 
                   textAlign: 'center',
                   color: '#dbeafe'
               }}>
                   No category data available
               </div>
             ) : (
               categoryData.map((category, i) => (
                 <div key={i} className="progress-item">
                   <div className="progress-label">
                     <span>{category.name}</span>
                     <span>{category.value}% ({category.count})</span>
                   </div>
                   <div className="progress-bar">
                     <div
                       className="progress-fill"
                       style={{
                         width: `${category.value}%`,
                         backgroundColor: i % 2 === 0 ? "#4f46e5" : "#06b6d4",
                       }}
                     ></div>
                   </div>
                 </div>
               ))
             )}
           </div>
           </div>
       )
   }