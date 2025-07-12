import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Inventory.css'

const columns = ["Product", "Model ID", "Size", "Stock", "Price", "Actions"];

export default function InventoryTable (){
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/get-products/');
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:8000/api/delete-product/${productId}/`);
                fetchProducts(); // Refresh the list
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Failed to delete product');
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
    }

    return(
        <table className="inventory-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
            <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                No products found. Add some products to get started!
              </td>
            </tr>
          ) : (
            products.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="product-info">
                    <div className="product-img-placeholder">40×40</div>
                    <div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-variant">ID: {item.id}</div>
                    </div>
                  </div>
                </td>
                <td>{item.model_no}</td>
                <td>{item.size}</td>
                <td>{item.pieces}</td>
                <td>₹{parseFloat(item.price).toFixed(2)}</td>
                <td>
                  <span className="edit-link">Edit</span> 
                  <span className="delete-link" onClick={() => handleDelete(item.id)}>Delete</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
        
    )
}