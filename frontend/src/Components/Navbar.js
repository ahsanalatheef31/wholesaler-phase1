import { Link } from 'react-router-dom';
import "../Styles/Navbar.css"


export default function Navbar(){
   

    return (
        <div>
        <div className="navbar">
            <p className='header'>wholesaler</p>
            <div className='links'>
             <Link to="/dashboard">Dashboard</Link>
             <Link to="/inventory">Inventory</Link>
             <Link to="/orders">Orders</Link>
             <Link to="/supplier">Supplier</Link>
             <Link to="/reports">Reports</Link>
             <Link to="/invoice">Invoice</Link>
             </div>
        </div>
        </div>
    )
}