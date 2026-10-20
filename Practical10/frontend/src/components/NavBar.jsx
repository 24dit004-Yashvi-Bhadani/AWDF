import { memo } from 'react'
import { Link } from 'react-router-dom'
import './navbar.css'

function NavBar() {
    return (
        <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/tasks">Tasks</Link>
        </nav>
    )
}

export default memo(NavBar)