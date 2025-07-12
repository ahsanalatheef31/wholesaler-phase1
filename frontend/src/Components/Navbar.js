import { Link } from 'react-router-dom';
import "../Styles/Navbar.css"
import Profile from '../images/profile.png'
import { useAuth } from '../Context/AuthContext';

export default function Navbar(){
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

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
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={handleLogout} className='logout'>Logout</button>
                <Link to="/profile" className='profile-picture'><img src={Profile} alt='profile' /></Link>
            </div>
        </div>
        </div>
    )
}