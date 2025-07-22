import { Link } from 'react-router-dom';
import '../Styles/Header.css'
import Profile from '../images/profile.png'
import { useAuth } from '../Context/AuthContext';
export default function Header(){
    const { logout } = useAuth();
    const handleLogout = () => {
    logout();
    window.location.href = '/login';
    };
 return (
        <div className="top-header">
            
                <button onClick={handleLogout} className='logout'>Logout</button>
                <Link to="/profile" className='profile-picture'><img src={Profile} alt='profile' /></Link>
            
        </div>
    )
    
}