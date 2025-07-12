import '../../Styles/Inventory.css'
export default function Filters(){
    return(
        <div className="inventory-filters">
        <input  type="text"
        placeholder="Search..."/>
        <select>
          <option>All Categories</option>
          <option>Beverages</option>
          <option>Packaging</option>
        </select>
        <select>
          <option>Sort by</option>
          <option>Price</option>
          <option>Stock</option>
        </select>
      </div>
    )
}