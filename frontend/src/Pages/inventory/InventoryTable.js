import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Inventory.css';
import { useNavigate } from 'react-router-dom';

const columns = ["Product", "Model ID", "Size", "Stock", "Price", "Supplier", "Bill Number", "Actions", "status"];
const statusOptions = ["Pending", "Defective", "Returned"];

export default function InventoryTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [billNumbers, setBillNumbers] = useState([]);
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const [billDropdownOpen, setBillDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchBillNumbers();
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

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/suppliers/');
      setSuppliers(res.data);
    } catch (err) {
      setSuppliers([]);
    }
  };

  const fetchBillNumbers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/invoices/');
      setBillNumbers(res.data.map(inv => inv.bill_number));
    } catch (err) {
      setBillNumbers([]);
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

  // Handle edit form submit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      // You may need to adjust the endpoint and payload to match your backend
      await axios.post(`http://localhost:8000/api/update-product/${editingProduct.id}/`, editingProduct);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
    <>
      {editingProduct && (
        <form
          onSubmit={handleUpdateProduct}
          style={{ marginBottom: 20, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#f9f9f9' }}
        >
          <h3>Edit Product</h3>
          <input
            value={editingProduct.name}
            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
            placeholder="Product Name"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.model_no}
            onChange={e => setEditingProduct({ ...editingProduct, model_no: e.target.value })}
            placeholder="Model ID"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.size}
            onChange={e => setEditingProduct({ ...editingProduct, size: e.target.value })}
            placeholder="Size"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.pieces}
            onChange={e => setEditingProduct({ ...editingProduct, pieces: e.target.value })}
            placeholder="Stock"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.price}
            onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
            placeholder="Price"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          {/* Supplier custom dropdown */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              value={suppliers.find(s => s.id === editingProduct.supplier)?.name || ''}
              onFocus={() => setSupplierDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSupplierDropdownOpen(false), 150)}
              onChange={e => {
                setEditingProduct({ ...editingProduct, supplier: '' });
              }}
              placeholder="Select Supplier"
              style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
              readOnly
            />
            {supplierDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', zIndex: 10, maxHeight: 180, overflowY: 'auto', borderRadius: 4 }}>
                {suppliers.map(s => (
                  <div
                    key={s.id}
                    style={{ padding: 8, cursor: 'pointer', color: '#222' }}
                    onMouseDown={() => {
                      setEditingProduct({ ...editingProduct, supplier: s.id });
                      setSupplierDropdownOpen(false);
                    }}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Bill number custom dropdown */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              value={editingProduct.bill_number || ''}
              onFocus={() => setBillDropdownOpen(true)}
              onBlur={() => setTimeout(() => setBillDropdownOpen(false), 150)}
              onChange={e => {
                setEditingProduct({ ...editingProduct, bill_number: e.target.value });
              }}
              placeholder="Select Bill Number"
              style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
              readOnly
            />
            {billDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', zIndex: 10, maxHeight: 180, overflowY: 'auto', borderRadius: 4 }}>
                {billNumbers.map(bn => (
                  <div
                    key={bn}
                    style={{ padding: 8, cursor: 'pointer', color: '#222' }}
                    onMouseDown={() => {
                      setEditingProduct({ ...editingProduct, bill_number: bn });
                      setBillDropdownOpen(false);
                    }}
                  >
                    {bn}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" style={{ marginRight: 8, background: '#2451a4', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 20px', fontWeight: 500, fontSize: 16 }}>Update</button>
          <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '8px 20px', borderRadius: 5, border: '1px solid #ccc', background: '#fff', fontWeight: 500, fontSize: 16 }}>Cancel</button>
        </form>
      )}
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
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
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
                <td>{item.supplier_name ? item.supplier_name : 'N/A'}</td>
                <td>
                  {item.bill_number ? (
                    <span
                      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => navigate(`/invoice/${item.bill_number}`)}
                    >
                      {item.bill_number}
                    </span>
                  ) : (
                    <span style={{ color: '#aaa' }}>N/A</span>
                  )}
                </td>
                <td>
                  <span
                    onClick={() => setEditingProduct(item)}
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer', marginRight: 10 }}
                  >
                    Edit
                  </span>
                  <span
                    onClick={() => handleDelete(item.id)}
                    style={{ color: 'red', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Delete
                  </span>
                </td>
                <td style={{ minWidth: 180 }}>
                  <div className="status-actions-row standard">
                    <button
                      title="Mark as Received"
                      className={`status-icon-btn-standard${item.status === 'Received' ? ' active' : ''}`}
                      onClick={() => updateStatus(item.id, 'Received')}
                    >
                      <img
                        src="/checkmark.png"
                        alt="tick"
                        width={20}
                        height={20}
                        style={{
                          filter: item.status === 'Received' ? 'none' : 'grayscale(1) brightness(1.7)',
                          opacity: item.status === 'Received' ? 1 : 0.7
                        }}
                      />
                    </button>
                    <button
                      title="Change Status"
                      className={`status-icon-btn-standard${['Defective', 'Returned'].includes(item.status) ? ' active-x' : ''}`}
                      onClick={() => handleDropdown(item.id, !dropdownOpen[item.id])}
                    >
                      <img
                        src="/cross.png"
                        alt="cross"
                        width={20}
                        height={20}
                        style={{
                          filter: ['Defective', 'Returned'].includes(item.status) ? 'none' : 'grayscale(1) brightness(1.7)',
                          opacity: ['Defective', 'Returned'].includes(item.status) ? 1 : 0.7
                        }}
                      />
                    </button>
                    {dropdownOpen[item.id] ? (
                      <select
                        className="status-dropdown-standard status-dropdown-inline"
                        autoFocus
                        value={item.status !== 'Received' ? item.status : ''}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        onBlur={() => handleDropdown(item.id, false)}
                      >
                        <option value="" disabled>Choose</option>
                        {statusOptions.map((opt) => (
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
    </>
  );
}