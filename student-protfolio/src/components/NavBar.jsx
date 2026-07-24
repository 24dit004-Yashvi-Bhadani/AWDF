import { Link } from 'react-router-dom'
import './navbar.css'

function NavBar() {
    return (
        <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/Project">Projects</Link>
            <Link to="/Contect">Contact</Link>
        </nav>
    )
}

export default NavBar