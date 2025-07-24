import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Styles/InvoiceDetails.css";

export default function InvoiceDetails() {
  const { billNumber } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/invoices/${billNumber}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch invoice details");
        }
        const data = await response.json();
        setInvoice(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [billNumber]);

  if (loading) return <div className="invoice-details-container">Loading...</div>;
  if (error) return <div className="invoice-details-container">Error: {error}</div>;
  if (!invoice) return <div className="invoice-details-container">No invoice found.</div>;

  return (
    <div className="invoice-details-container">
      <h2>Invoice Details - {billNumber}</h2>
      <p><strong>Supplier:</strong> {invoice.supplier_name}</p>
      <p><strong>Date:</strong> {invoice.created_at}</p>

      <table className="invoice-details-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Model ID</th>
            <th>Price</th>
            <th>Size</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {invoice.products.map((item, index) => (
            <tr key={index}>
              <td>{item.product_name}</td>
              <td>{item.model_id}</td>
              <td>{item.price}</td>
              <td>{item.size}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
