import React, { useState } from 'react';
import Filters from './filters'
import '../../Styles/Inventory.css';
import InventoryTable from './InventoryTable';
import AddNew from './AddNew';

export default function Inventory() {
  const [filters, setFilters] = useState({
    search: '',
    supplier_id: 'all',
    category_id: 'all',
    status: 'all',
    size_id: 'all',
    color_id: 'all',
    material_id: 'all'
  });

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <AddNew/>
      </div>
      <Filters onFilterChange={setFilters} />
      <InventoryTable filters={filters} />
    </div>
  );
}
