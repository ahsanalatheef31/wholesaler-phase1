import React, { useState } from 'react';
import './AddProduct'
import '../../Styles/Inventory.css'
import AddProduct from './AddProduct';
export default function AddNew(){
    const [showForm,setShowForm] = useState(false)
    const handleAddItemClick = () =>{
        setShowForm(true)
    }
    return(
        <div className='product-container'>
        <button className="add-btn" onClick={handleAddItemClick}>+ Add New Item</button>
        {showForm && (
        <div className="overlay-form">
          <AddProduct/>
          
        </div>
      )}
        </div>
        
    )
}