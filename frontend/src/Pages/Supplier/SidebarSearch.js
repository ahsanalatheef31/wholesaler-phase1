import React, { useState } from 'react';
import '../../Styles/SidebarSearch.css';

export default function SidebarSearch({ suppliers }) {
  const [query, setQuery] = useState('');

  const filtered = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(query.toLowerCase()) ||
    supplier.email.toLowerCase().includes(query.toLowerCase()) ||
    supplier.phone.includes(query)
  );

  return (
    <div className="sidebar-search">
      <input
        type="text"
        placeholder="Search suppliers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sidebar-search-input"
      />

      {query && (
        <div className="search-results">
          <h4>Results:</h4>
          {filtered.length > 0 ? (
            <ul>
              {filtered.map((supplier) => (
                <li key={supplier.id}>
                  <strong>{supplier.name}</strong><br />
                  <small>{supplier.phone}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-match">No matches found</p>
          )}
        </div>
      )}
    </div>
  );
}
