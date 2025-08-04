import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/invoice.css";
import { extractProductsFromPdf } from "../inventory/pdfExtractUtils";

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

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setPdfLoading(true);
    setPdfError('');
    
    // Generate a unique bill number
    setBillNumber("INV" + Date.now());
    
    if (uploadedFile && uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      try {
        const result = await extractProductsFromPdf(uploadedFile);
        setPdfLoading(false);
        
        if (result.error) {
          setPdfError(result.error);
          // Still add an empty row for manual entry
          setTableData([{ id: Date.now(), name: "", model: "", price: "", size: "", quantity: 1 }]);
        } else {
          // Convert extracted products to table format
          const extractedProducts = result.products.map((product, index) => ({
            id: Date.now() + index,
            name: product.name || "",
            model: product.model_no || product.model || "",
            price: product.price || "",
            size: product.size || "",
            quantity: product.pieces || product.quantity || 1
          }));
          setTableData(extractedProducts);
        }
      } catch (error) {
        setPdfLoading(false);
        setPdfError('Failed to process PDF. Please try again.');
        setTableData([{ id: Date.now(), name: "", model: "", price: "", size: "", quantity: 1 }]);
      }
    } else {
      setPdfLoading(false);
      // For non-PDF files, just add an empty row
      setTableData([{ id: Date.now(), name: "", model: "", price: "", size: "", quantity: 1 }]);
    }
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
        {console.log('showModal value:', showModal)}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Invoice</h3>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="invoice-file-upload" style={{ display: 'inline-block', background: '#2451a4', color: '#fff', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 16 }}>
                  {pdfLoading ? 'Processing PDF...' : 'Choose Invoice File'}
                  <input
                    id="invoice-file-upload"
                    type="file"
                    accept=".pdf,.png,.jpg"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={pdfLoading}
                  />
                </label>
                
                {pdfError && (
                  <div style={{ color: 'red', marginTop: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                    ❌ {pdfError}
                  </div>
                )}
              </div>
              
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
        <button 
          className="add-btn" 
          style={{ width: '100%', marginBottom: 16 }} 
          onClick={() => {
            console.log('Add invoice button clicked');
            setShowModal(true);
            console.log('showModal set to true');
          }}
        >
          + Add New Invoice
        </button>
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