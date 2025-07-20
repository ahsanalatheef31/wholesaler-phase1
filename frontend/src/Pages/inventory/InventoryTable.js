import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Inventory.css';

const columns = ["Product", "Model ID", "Size", "Stock", "Price", "Actions", "Status"];
const statusOptions = ["Pending", "Defective", "Returned"];

export default function InventoryTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({});

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
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const updateStatus = async (productId, status) => {
    try {
      await axios.post(`http://localhost:8000/api/update-status/${productId}/`, { status });
      setDropdownOpen((prev) => ({ ...prev, [productId]: false }));
      fetchProducts();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDropdown = (productId, open) => {
    setDropdownOpen((prev) => ({ ...prev, [productId]: open }));
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
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
            <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
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
              <td style={{ minWidth: 180 }}>
                <div className="status-actions-row standard">
                  <button
                    title="Mark as Received"
                    className={`status-icon-btn-standard${item.status === 'Received' ? ' active' : ''}`}
                    onClick={() => updateStatus(item.id, 'Received')}
                  >
                    <img src="/checkmark.png" alt="tick" width={20} height={20} style={{ filter: item.status === 'Received' ? 'none' : 'grayscale(1) brightness(1.7)', opacity: item.status === 'Received' ? 1 : 0.7 }} />
                  </button>
                  <button
                    title="Change Status"
                    className={`status-icon-btn-standard${['Defective','Returned'].includes(item.status) ? ' active-x' : ''}`}
                    onClick={() => handleDropdown(item.id, !dropdownOpen[item.id])}
                  >
                    <img src="/cross.png" alt="cross" width={20} height={20} style={{ filter: ['Defective','Returned'].includes(item.status) ? 'none' : 'grayscale(1) brightness(1.7)', opacity: ['Defective','Returned'].includes(item.status) ? 1 : 0.7 }} />
                  </button>
                  {dropdownOpen[item.id] ? (
                    <select
                      className="status-dropdown-standard status-dropdown-inline"
                      autoFocus
                      value={item.status !== 'Received' ? item.status : ''}
                      onChange={e => updateStatus(item.id, e.target.value)}
                      onBlur={() => handleDropdown(item.id, false)}
                    >
                      <option value="" disabled>Choose</option>
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="status-text-standard">{item.status}</span>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}