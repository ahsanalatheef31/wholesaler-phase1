import Filters from './filters'
import '../../Styles/Inventory.css';
import InventoryTable from './InventoryTable';
import AddNew from './AddNew';

export default function Inventory() {
  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <AddNew/>
      </div>
    <Filters/>
    <InventoryTable/>
      </div>
  );
}
