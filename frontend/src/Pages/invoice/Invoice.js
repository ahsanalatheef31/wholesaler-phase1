import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/invoice.css";

export default function Invoice() {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [billNumber, setBillNumber] = useState("");
  const [invoiceList, setInvoiceList] = useState([]);

  const navigate = useNavigate();

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/invoices/");
      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }
      const data = await response.json();
      setInvoiceList(data);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    const dummyData = [
      { id: 1, name: "Dominos", model: "A2485", price: "189999", size: "16 inch", quantity: 5 },
      { id: 2, name: "Pepsi", model: "P1234", price: "599", size: "1L", quantity: 10 },
    ];
    setTableData(dummyData);
    setBillNumber("INV" + Date.now());
  };

  const handleDelete = (id) => {
    setTableData(prev => prev.filter(item => item.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    setTableData(prev =>
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  // Submit invoice to backend
  const handleSubmit = async () => {
    const newInvoice = {
      bill_number: billNumber,
      file_name: file ? file.name : "",
      items: tableData.map(item => ({
        product: item.name,
        model_id: item.model,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch("http://localhost:8000/api/invoices/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInvoice),
      });

      if (!response.ok) {
        throw new Error("Failed to save invoice");
      }

      // Refresh invoice list from backend
      fetchInvoices();

      setShowModal(false);
      setTableData([]);
      setFile(null);
      setBillNumber("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Main Content */}
      <div className="invoice-main-content" style={{ flex: 1, padding: 32, marginLeft: 270 }}>
        <h2>Invoice List</h2>
        <table className="invoice-table">
          <thead>
            <tr>
              <th> </th>
              <th>Bill Number</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {invoiceList.map((invoice, index) => (
              <tr key={index} onClick={() => navigate(`/invoice/${invoice.bill_number}`)}>
                <td>{index + 1}</td>
                <td style={{ color: "blue", cursor: "pointer" }}>{invoice.bill_number}</td>
                <td>{invoice.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Modal for adding invoice */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Invoice</h3>
              <label htmlFor="invoice-file-upload" style={{ display: 'inline-block', background: '#2451a4', color: '#fff', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 16, marginBottom: 16 }}>
                Choose Invoice
                <input
                  id="invoice-file-upload"
                  type="file"
                  accept=".pdf,.png,.jpg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              {tableData.length > 0 && (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Model ID</th>
                        <th>Price</th>
                        <th>Size</th>
                        <th>Quantity</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map(item => (
                        <tr key={item.id}>
                          <td><input value={item.name} onChange={(e) => handleInputChange(item.id, "name", e.target.value)} /></td>
                          <td><input value={item.model} onChange={(e) => handleInputChange(item.id, "model", e.target.value)} /></td>
                          <td><input value={item.price} onChange={(e) => handleInputChange(item.id, "price", e.target.value)} /></td>
                          <td><input value={item.size} onChange={(e) => handleInputChange(item.id, "size", e.target.value)} /></td>
                          <td><input value={item.quantity} onChange={(e) => handleInputChange(item.id, "quantity", e.target.value)} /></td>
                          <td><button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="submit-btn" onClick={handleSubmit}>Submit Invoice</button>
                </>
              )}
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {/* Sidebar on the right */}
      <div style={{ width: 300, background: '#fafbfc', padding: 24, borderLeft: '1px solid #eee', minHeight: '100vh' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 16 }}>Total Invoices: {invoiceList.length}</div>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>Invoice Actions</h2>
        <button className="add-btn" style={{ width: '100%', marginBottom: 16 }} onClick={() => setShowModal(true)}>+ Add New Invoice</button>
        <input
          type="text"
          placeholder="Search invoices..."
          className="input-field"
          style={{ width: '100%', marginBottom: 16 }}
          // onChange={...}
        />
        <div className="invoice-quick-links">
          <div className="invoice-quick-links-heading">Quick Links</div>
          <a href="/invoices" className="invoice-quick-link">All Invoices</a>
          <a href="/invoices/recent" className="invoice-quick-link">Recently Created</a>
          <a href="/invoices/pending" className="invoice-quick-link">Pending Payments</a>
          <a href="/invoices/paid" className="invoice-quick-link">Paid Invoices</a>
          <a href="/invoices/overdue" className="invoice-quick-link">Overdue Invoices</a>
        </div>
      </div>
    </div>
  );
}